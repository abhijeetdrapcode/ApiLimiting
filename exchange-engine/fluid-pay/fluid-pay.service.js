import axios from 'axios';
import { endsWith } from 'voca';
import { replaceValueFromSource } from 'drapcode-utility';
import { multiTenantCollService } from '../collection/collection.service';
import { getItemToPurchase } from '../item/item.service';

export const prepareAndProcessFluidPay = async (
  projectId,
  db,
  user,
  tenant,
  body,
  fluidPaySetting,
  environment,
) => {
  const {
    paymentResponseToken,
    collectionName,
    itemUuid,
    itemPriceField,
    itemDescField,
    // paymentResponseUser,
    tenantUuid,
    isTenantFromRecord,
  } = body;

  let collectionTenant = null;
  if (isTenantFromRecord) {
    if (tenantUuid) {
      let multiTenantCollection = await multiTenantCollService(projectId);
      if (multiTenantCollection) {
        multiTenantCollection = multiTenantCollection.collectionName;
        collectionTenant = await getItemToPurchase(
          db,
          projectId,
          multiTenantCollection,
          tenantUuid,
        );
      }
      collectionTenant = collectionTenant ? collectionTenant : null;
    }
  } else {
    collectionTenant = tenant;
  }
  let { privateKey, apiUrl, currency, email_receipt, successURL, failedURL } = fluidPaySetting;
  privateKey = replaceValueFromSource(privateKey, environment, collectionTenant);
  apiUrl = replaceValueFromSource(apiUrl, environment, collectionTenant);

  if (!endsWith(apiUrl, '/')) {
    apiUrl += '/';
  }
  const productToPurchaseResponse = await getItemToPurchase(
    db,
    projectId,
    collectionName,
    itemUuid,
  );
  if (!productToPurchaseResponse || productToPurchaseResponse.code === 400) {
    return {
      code: 400,
      message: productToPurchaseResponse.message,
      status: 'FAILED',
    };
  }
  const productToPurchase = productToPurchaseResponse;
  /**
   * Product Price
   */
  let productPrice = '';
  productPrice = productToPurchase[itemPriceField];
  productPrice = productPrice ? productPrice : 0;

  /**
   * Product Description
   */
  let productDescription = '';
  productDescription = productToPurchase[itemDescField];
  productDescription = productDescription ? productDescription : 'Unique Project';

  /**
   * Prepare Transaction for Fluid
   */
  let emailAddress = 'user@email.com';
  if (email_receipt && user) {
    emailAddress = user.userName ? user.userName : user.email;
  }
  const transaction = {
    type: 'sale',
    amount: productPrice * 100,
    currency: currency,
    description: productDescription,
    // order_id: productToPurchase.uuid,
    email_receipt: email_receipt,
    email_address: emailAddress,
    payment_method: {
      token: paymentResponseToken,
    },
  };

  //Create Header Token
  const header = {
    headers: {
      Authorization: privateKey,
      'Content-Type': 'application/json',
    },
  };
  try {
    const { data: fluidResponse } = await axios.post(
      `${apiUrl}api/transaction`,
      transaction,
      header,
    );
    //TODO: Add condition for failed on basis of status
    if (!fluidResponse) {
      return {
        code: 400,
        status: 'FAILED',
        message: 'No response',
        failedURL,
      };
    }
    if (fluidResponse.status !== 'success') {
      return {
        code: 400,
        status: 'FAILED',
        message: fluidResponse.msg,
        failedURL,
      };
    }
    const { status, response_code } = fluidResponse.data;
    if (status === 'declined') {
      const message = prepareErrorMessage(response_code);
      return {
        code: 400,
        status: 'FAILED',
        message: message,
        failedURL,
      };
    }
    return {
      code: 200,
      fluidResponse: fluidResponse.data,
      status: 'SUCCESS',
      successURL,
      failedURL,
    };
  } catch (error) {
    console.error('error', error);
    let errorData = '';
    if (error.response) {
      errorData = error?.response?.data?.msg;
    }
    return {
      code: 400,
      message: errorData,
      failedURL,
      status: 'FAILED',
    };
  }
};

const prepareErrorMessage = (response_code) => {
  if (response_code === 0) {
    return 'Unknown, please contact support for more information';
  } else if (response_code === 99) {
    return 'Used in redirect processors prior to payment being received';
  } else if (response_code >= 200 && response_code < 300) {
    return 'Transaction has been declined by the issuer for various reasons';
  } else if (response_code >= 300 && response_code < 400) {
    return 'Platform decline for configuration or fraud reasons';
  } else if (response_code >= 400 && response_code < 500) {
    return 'Errors returned from the processor';
  }
};
