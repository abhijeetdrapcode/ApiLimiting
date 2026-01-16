import { pluginCode } from 'drapcode-constant';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
import { collectionNotFoundMessage, pluginNotInstalledMessage } from '../utils/appUtils';
import { findOneCollectionService } from '../collection/collection.service';
import { findItemById, saveItem, updateCollectionItem } from '../item/item.service';
import { encryptMpesaSecurityCredential, handleMPesaRefreshTokenProcess } from './mPesa.utils';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getReferenceFieldValue, preparePluginCredentials } from '../utils/utils';
import { cryptService } from '../middleware/encryption.middleware';

export const initiateStkPushService = async (
  db,
  projectId,
  enableAuditTrail,
  user,
  tenant,
  subTenant,
  headers,
  environment,
  phoneNumberField,
  amountField,
  itemId,
  collection,
  callbackUrl,
  transactionType,
) => {
  try {
    const mPesaPlugin = await findInstalledPlugin(projectId, pluginCode.M_PESA);
    if (!mPesaPlugin) return pluginNotInstalledMessage('M-Pesa');
    const processedCredentials = preparePluginCredentials(mPesaPlugin.setting, environment, tenant);
    const collectionDetails = await findOneCollectionService(projectId, collection);
    if (!collectionDetails) return collectionNotFoundMessage(collection);
    const itemResponse = await findItemById(db, projectId, collectionDetails, itemId, null);
    if (itemResponse.code !== 200) return itemResponse;
    itemResponse.data = await cryptService(
      itemResponse.data,
      projectId,
      collectionDetails,
      true,
      false,
      true,
    );
    const phoneNumber = getReferenceFieldValue(itemResponse?.data, phoneNumberField).replace(
      /[+\s]/g,
      '',
    );
    if (!phoneNumber) return { code: 400, message: 'Phone Number is required.' };
    const amount = getReferenceFieldValue(itemResponse?.data, amountField);
    if (!amount) return { code: 400, message: 'Amount is required.' };
    const {
      shortCode,
      consumerKey,
      consumerSecret,
      passkey,
      environment: mPesaEnvironment,
    } = processedCredentials;
    if (!passkey)
      return {
        code: 400,
        message: 'M-Pesa Passkey is required in plugin settings for C2B STK Push.',
      };
    const isProd = mPesaEnvironment.toLowerCase() === 'production';
    const mPesaCallbackResponsesCollection = await findOneCollectionService(
      projectId,
      'mpesa_callback_responses',
    );
    if (!mPesaCallbackResponsesCollection) {
      return collectionNotFoundMessage('MPesa Callback Responses');
    }
    const itemData = {
      userId: user?.uuid || '',
      tenantId: tenant?.uuid || '',
      subTenantId: subTenant?.uuid || '',
      amount,
      phoneNumber,
      status: 'PENDING',
      transactionType: 'STK Push',
    };
    const saveItemResponse = await saveItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      mPesaCallbackResponsesCollection,
      itemData,
    );
    if (saveItemResponse.code !== 201) return saveItemResponse;
    const internalPaymentId = saveItemResponse?.data?.uuid;
    const mPesaTokenCollection = await findOneCollectionService(projectId, 'mpesa_oauth_tokens');
    if (!mPesaTokenCollection) return collectionNotFoundMessage('MPesa OAuth Tokens');
    let { data: tokenItem } = await findItemById(db, projectId, mPesaTokenCollection, null, {
      userId: { $in: [user?.uuid] },
    });
    const now = new Date();
    const isTokenExpired = tokenItem && new Date(tokenItem.expiry_date) <= now;
    if (!tokenItem?.access_token || isTokenExpired) {
      const refreshTokenResponse = await handleMPesaRefreshTokenProcess(
        db,
        projectId,
        enableAuditTrail,
        user,
        tenant,
        headers,
        environment,
        consumerKey,
        consumerSecret,
        mPesaEnvironment,
        mPesaTokenCollection,
        isTokenExpired ? tokenItem : null,
      );
      if (![200, 201].includes(refreshTokenResponse.code)) return refreshTokenResponse;
      tokenItem = refreshTokenResponse.token;
    }
    const stkUrl = isProd
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
    const password = Buffer.from(
      `${isProd ? shortCode : '174379'}${
        isProd ? passkey : 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
      }${timestamp}`,
    ).toString('base64');
    const payload = {
      BusinessShortCode: isProd ? shortCode : '174379',
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: isProd ? shortCode : '174379',
      PhoneNumber: phoneNumber,
      CallBackURL: `${callbackUrl}?internalPaymentId=${internalPaymentId}&mPesaEnvironment=${mPesaEnvironment.toLowerCase()}`,
      AccountReference: internalPaymentId,
      TransactionDesc: 'Payment',
    };
    const response = await axios.post(stkUrl, payload, {
      headers: { Authorization: `Bearer ${tokenItem?.access_token}` },
    });
    const { data } = await updateCollectionItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      mPesaCallbackResponsesCollection,
      internalPaymentId,
      {
        ...response.data,
        ResultCode: response?.data?.ResponseCode,
        ResultDesc: response?.data?.ResponseDescription,
      },
    );
    return { code: response?.status || 200, mPesaResponse: response?.data, data };
  } catch (error) {
    console.error('Error in initiateStkPushService;', error);
    return {
      code: error?.response?.status || 500,
      message: error?.response?.data?.errorMessage || 'Internal Server Error',
      error: error?.response?.data || error?.message || error,
    };
  }
};

export const mPesaSTKPushCallbackService = async (
  db,
  projectId,
  environment,
  enableAuditTrail,
  body,
  query,
) => {
  try {
    const mPesaCallbackResponsesCollection = await findOneCollectionService(
      projectId,
      'mpesa_callback_responses',
    );
    if (!mPesaCallbackResponsesCollection) {
      return collectionNotFoundMessage('MPesa Callback Responses');
    }
    const { Body } = body;
    const { stkCallback } = Body;
    const items = stkCallback?.CallbackMetadata?.Item || [];
    const { internalPaymentId: paymentId, mPesaEnvironment } = query;
    const internalPaymentId = items.find((i) => i.Name === 'AccountReference')?.Value || paymentId;
    const isProd = mPesaEnvironment.toLowerCase() === 'production';
    let status;
    if (!isProd && stkCallback?.ResultCode === 1037) {
      status = 'SUCCESS';
      stkCallback.ResultCode = 0;
      stkCallback.ResultDesc = 'The service request is processed successfully.';
    } else {
      status = stkCallback?.ResultCode === 0 ? 'SUCCESS' : 'FAILED';
    }
    const saveData = {
      ...stkCallback,
      status,
      rawResponse: isProd ? body : '',
    };
    const response = await updateCollectionItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      mPesaCallbackResponsesCollection,
      internalPaymentId,
      saveData,
    );
    return response;
  } catch (error) {
    console.error('Error in mPesaCallbackService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const initiateB2CPayoutService = async (
  db,
  projectId,
  enableAuditTrail,
  user,
  tenant,
  headers,
  environment,
  subTenant,
  phoneNumberField,
  amountField,
  itemId,
  collection,
  transactionType,
  occasionField,
  timeoutUrl,
  resultUrl,
) => {
  try {
    const mPesaPlugin = await findInstalledPlugin(projectId, pluginCode.M_PESA);
    if (!mPesaPlugin) return pluginNotInstalledMessage('M-Pesa');
    const processedCredentials = preparePluginCredentials(mPesaPlugin.setting, environment, tenant);
    const collectionDetails = await findOneCollectionService(projectId, collection);
    if (!collectionDetails) return collectionNotFoundMessage(collection);
    const itemResponse = await findItemById(db, projectId, collectionDetails, itemId, null);
    if (itemResponse.code !== 200) return itemResponse;
    itemResponse.data = await cryptService(
      itemResponse.data,
      projectId,
      collectionDetails,
      true,
      false,
      true,
    );
    const phoneNumber = getReferenceFieldValue(itemResponse?.data, phoneNumberField).replace(
      /[+\s]/g,
      '',
    );
    if (!phoneNumber) return { code: 400, message: 'Phone Number is required.' };
    const amount = getReferenceFieldValue(itemResponse?.data, amountField);
    if (!amount) return { code: 400, message: 'Amount is required.' };
    const {
      shortCode,
      initiatorName,
      environment: mPesaEnvironment,
      consumerKey,
      consumerSecret,
      initiatorPassword,
    } = processedCredentials;
    const isProd = mPesaEnvironment.toLowerCase() === 'production';
    const mPesaCallbackResponsesCollection = await findOneCollectionService(
      projectId,
      'mpesa_callback_responses',
    );
    if (!mPesaCallbackResponsesCollection) {
      return collectionNotFoundMessage('MPesa Callback Responses');
    }
    const itemData = {
      userId: user?.uuid || '',
      tenantId: tenant?.uuid || '',
      subTenantId: subTenant?.uuid || '',
      amount,
      phoneNumber,
      status: 'PENDING',
      transactionType: 'B2C',
    };
    const saveItemResponse = await saveItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      mPesaCallbackResponsesCollection,
      itemData,
    );
    if (saveItemResponse.code !== 201) return saveItemResponse;
    const internalPaymentId = saveItemResponse?.data?.uuid;
    const mPesaTokenCollection = await findOneCollectionService(projectId, 'mpesa_oauth_tokens');
    if (!mPesaTokenCollection) return collectionNotFoundMessage('MPesa OAuth Tokens');
    let { data: tokenItem } = await findItemById(db, projectId, mPesaTokenCollection, null, {
      userId: { $in: [user?.uuid] },
    });
    const now = new Date();
    const isTokenExpired = tokenItem && new Date(tokenItem.expiry_date) <= now;
    if (!tokenItem?.access_token || isTokenExpired) {
      const refreshTokenResponse = await handleMPesaRefreshTokenProcess(
        db,
        projectId,
        enableAuditTrail,
        user,
        tenant,
        headers,
        environment,
        consumerKey,
        consumerSecret,
        mPesaEnvironment,
        mPesaTokenCollection,
        isTokenExpired ? tokenItem : null,
      );
      if (![200, 201].includes(refreshTokenResponse.code)) return refreshTokenResponse;
      tokenItem = refreshTokenResponse.token;
    }
    const occasion = getReferenceFieldValue(itemResponse?.data, occasionField) || 'Occasion';
    const certificatePath = isProd
      ? process.env.MPESA_PRODUCTION_CERTIFICATE
      : process.env.MPESA_SANDBOX_CERTIFICATE;
    const encryptedSecurityCredential = encryptMpesaSecurityCredential(
      isProd ? initiatorPassword : 'Safaricom123!!',
      certificatePath,
    );
    const url = isProd
      ? 'https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest';
    const mpesaBody = {
      OriginatorConversationID: uuidv4(),
      InitiatorName: isProd ? initiatorName : 'testapi',
      SecurityCredential: encryptedSecurityCredential,
      CommandID: transactionType,
      Amount: amount,
      PartyA: isProd ? shortCode : '600997',
      PartyB: phoneNumber,
      Remarks: internalPaymentId,
      QueueTimeOutURL: `${timeoutUrl}?internalPaymentId=${internalPaymentId}&mPesaEnvironment=${mPesaEnvironment.toLowerCase()}`,
      ResultURL: `${resultUrl}?internalPaymentId=${internalPaymentId}&mPesaEnvironment=${mPesaEnvironment.toLowerCase()}`,
      Occasion: occasion,
    };
    const response = await axios.post(url, mpesaBody, {
      headers: { Authorization: `Bearer ${tokenItem?.access_token}` },
    });
    const { data } = await updateCollectionItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      mPesaCallbackResponsesCollection,
      internalPaymentId,
      {
        ...response.data,
        ResultCode: response.data.ResponseCode,
        ResultDesc: response.data.ResponseDescription,
      },
    );
    return { code: response?.status || 200, mPesaResponse: response?.data, data };
  } catch (error) {
    console.error('Error in initiateB2CPayoutService:', error);
    return {
      code: error?.response?.status || 500,
      message: error?.response?.data?.errorMessage || 'Internal Server Error',
      error: error?.response?.data || error?.message || error,
    };
  }
};

export const mPesaB2CCallbackService = async (
  db,
  projectId,
  environment,
  enableAuditTrail,
  body,
  query,
) => {
  try {
    const mPesaCallbackResponsesCollection = await findOneCollectionService(
      projectId,
      'mpesa_callback_responses',
    );
    if (!mPesaCallbackResponsesCollection) {
      return collectionNotFoundMessage('MPesa Callback Responses');
    }
    const { Result } = body;
    const { internalPaymentId: paymentId, mPesaEnvironment } = query;
    const internalPaymentId = Result?.Remarks || paymentId;
    const isProd = mPesaEnvironment.toLowerCase() === 'production';
    let status;
    if (!isProd && Result?.ResultCode === 8006) {
      status = 'SUCCESS';
      Result.ResultCode = 0;
      Result.ResultDesc = 'The service request is processed successfully.';
    } else {
      status = Result?.ResultCode === 0 ? 'SUCCESS' : 'FAILED';
    }
    const saveData = {
      ...Result,
      TransID: Result?.TransactionID || '',
      status,
      rawResponse: isProd ? body : '',
    };
    const response = await updateCollectionItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      mPesaCallbackResponsesCollection,
      internalPaymentId,
      saveData,
    );
    return response;
  } catch (error) {
    console.error('Error in mPesaB2CCallbackService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const mPesaC2BRegisterUrlService = async (
  db,
  projectId,
  environment,
  enableAuditTrail,
  user,
  tenant,
  headers,
  confirmationUrl,
) => {
  try {
    const mPesaPlugin = await findInstalledPlugin(projectId, pluginCode.M_PESA);
    if (!mPesaPlugin) return pluginNotInstalledMessage('M-Pesa');
    const processedCredentials = preparePluginCredentials(mPesaPlugin.setting, environment, tenant);
    const {
      shortCode,
      consumerKey,
      consumerSecret,
      environment: mPesaEnvironment,
    } = processedCredentials;
    const isProd = mPesaEnvironment.toLowerCase() === 'production';
    const mPesaTokenCollection = await findOneCollectionService(projectId, 'mpesa_oauth_tokens');
    if (!mPesaTokenCollection) return collectionNotFoundMessage('MPesa OAuth Tokens');
    let { data: tokenItem } = await findItemById(db, projectId, mPesaTokenCollection, null, {
      userId: { $in: [user?.uuid] },
    });
    const now = new Date();
    let refreshTokenResponse = null;
    const isTokenExpired = tokenItem && new Date(tokenItem.expiry_date) <= now;
    if (!tokenItem?.access_token || isTokenExpired) {
      refreshTokenResponse = await handleMPesaRefreshTokenProcess(
        db,
        projectId,
        enableAuditTrail,
        user,
        tenant,
        headers,
        environment,
        consumerKey,
        consumerSecret,
        mPesaEnvironment,
        mPesaTokenCollection,
        isTokenExpired ? tokenItem : null,
      );
      if (![200, 201].includes(refreshTokenResponse.code)) return refreshTokenResponse;
      tokenItem = refreshTokenResponse.token;
    }
    const url = isProd
      ? 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl'
      : 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl';
    const payload = {
      ShortCode: shortCode,
      ResponseType: 'Completed',
      ConfirmationURL: confirmationUrl,
      ValidationURL: confirmationUrl,
    };
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${tokenItem?.access_token}` },
    });
    return {
      code: response?.status || 200,
      message: 'C2B URLs registered successfully',
      data: response?.data,
    };
  } catch (error) {
    console.error('Error in mPesaC2BRegisterUrlService:', error);
    return {
      code: error?.response?.status || 500,
      message: error?.response?.data?.errorMessage || 'Internal Server Error',
      error: error?.response?.data || error?.message || error,
    };
  }
};

export const mPesaC2BConfirmationService = async (
  db,
  projectId,
  environment,
  enableAuditTrail,
  body,
) => {
  try {
    const mPesaCallbackResponsesCollection = await findOneCollectionService(
      projectId,
      'mpesa_callback_responses',
    );
    if (!mPesaCallbackResponsesCollection) {
      return collectionNotFoundMessage('MPesa Callback Responses');
    }
    const saveData = {
      ...body,
      status: 'SUCCESS',
      rawResponse: body,
    };
    const response = await saveItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      mPesaCallbackResponsesCollection,
      saveData,
    );
    return response;
  } catch (error) {
    console.error('Error in mPesaC2BConfirmationService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};
