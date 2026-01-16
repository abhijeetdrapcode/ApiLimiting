/* eslint-disable no-case-declarations */
import { Stripe } from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { pluginCode } from 'drapcode-constant';
import { replaceValueFromSource } from 'drapcode-utility';
import { checkCollectionByName, findOneCollectionService } from '../collection/collection.service';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
import { getItemToPurchase, getReferenceCollectionFieldData, list } from '../item/item.service';

const allowedSeparatePaymentRegions = [
  'AUSTRALIA',
  'BRAZIL',
  'CANADA',
  'EUROPE',
  'JAPAN',
  'MALAYSIA',
  'NEW_ZEALAND',
  'SINGAPORE',
  'UNITED_STATES',
];
export const processCheckout = async (req, res, next) => {
  const { db, projectId, environment } = req;
  try {
    const {
      itemUuid,
      collectionName,
      nameField,
      descriptionField,
      priceField,
      selectedCollectionData,
      customer,
    } = req.body;

    const productToPurchaseResponse = await getItemToPurchase(
      db,
      projectId,
      collectionName,
      itemUuid,
    );
    //Get Key From DB
    if (!productToPurchaseResponse || productToPurchaseResponse.code === 400) {
      return res.json({ code: 400, message: productToPurchaseResponse.message, status: 'failed' });
    }

    const productToPurchase = productToPurchaseResponse;
    let productName = '';
    let productDescription = '';
    let productAmount = '';

    if (nameField && nameField.includes('.')) {
      const fullNameParts = nameField.split('.');
      const collectionReferenceField = await getReferenceCollectionFieldData(
        fullNameParts,
        selectedCollectionData,
        productToPurchase,
      );
      if (!collectionReferenceField) {
        return res.json({ code: 400, message: 'Reference item field not found', status: 'failed' });
      }
      productName = collectionReferenceField;
    } else {
      productName = productToPurchase[nameField];
    }
    if (descriptionField && descriptionField.includes('.')) {
      const fullNameParts = descriptionField.split('.');
      const collectionReferenceField = await getReferenceCollectionFieldData(
        fullNameParts,
        selectedCollectionData,
        productToPurchase,
      );
      if (!collectionReferenceField) {
        return res.json({ code: 400, message: 'Reference item field not found', status: 'failed' });
      }
      productDescription = collectionReferenceField;
    } else {
      productDescription = productToPurchase[descriptionField];
    }

    const installedStripeConnect = await findInstalledPlugin(projectId, pluginCode.STRIPE_CONNECT);

    if (!installedStripeConnect) {
      return res.json({
        code: 400,
        message: 'Stripe Connect Payment Plugin not installed',
        status: 'failed',
      });
    }

    const { setting: pluginSetting } = installedStripeConnect;
    let {
      secretKey,
      failedURL,
      successURL,
      paymentMode,
      region,
      hasConnectedAccount,
      chargeType,
      currency,
      recurringInterval,
    } = pluginSetting;
    secretKey = replaceValueFromSource(secretKey, environment, null);
    failedURL = replaceValueFromSource(failedURL, environment, null);
    successURL = replaceValueFromSource(successURL, environment, null);

    const stripe = new Stripe(secretKey);
    const transferGroupId = uuidv4();
    const lineItems = [];
    let productPrice = '';
    if (priceField && priceField.includes('.')) {
      const fullNameParts = priceField.split('.');
      const collectionReferenceField = await getReferenceCollectionFieldData(
        fullNameParts,
        selectedCollectionData,
        productToPurchase,
      );
      if (!collectionReferenceField) {
        return res.json({ code: 400, message: 'Reference item field not found', status: 'failed' });
      }
      productPrice = collectionReferenceField;
    } else {
      productPrice = productToPurchase[priceField];
    }

    if (paymentMode === 'subscription' && customer) {
      productAmount = productPrice;
    } else {
      productAmount = productPrice ? productPrice * 100 : 0;
    }

    const productMetaData = {
      collectionId: collectionName,
      productId: itemUuid,
      transfer_group: transferGroupId,
    };

    const lineItemPriceData = {
      currency,
      product_data: {
        name: productName,
        description: productDescription,
      },
      unit_amount: productAmount,
    };

    if (paymentMode === 'subscription') {
      if (customer && productAmount) {
        lineItems.push({
          price: productAmount,
          quantity: 1,
        });
      } else {
        lineItemPriceData.recurring = {
          interval: recurringInterval ? recurringInterval : 'month',
        };
        lineItems.push({
          price_data: lineItemPriceData,
          quantity: 1,
        });
      }
    } else {
      lineItems.push({
        price_data: lineItemPriceData,
        quantity: 1,
      });
    }

    const doSeparatePayment = allowedSeparatePaymentRegions.includes(region);

    let session = null;
    const stripeConfig = {
      line_items: lineItems,
      mode: paymentMode,
      metadata: productMetaData,
      cancel_url: failedURL,
      success_url: successURL,
    };

    if (customer) {
      stripeConfig['customer'] = customer;
    }

    if (hasConnectedAccount && chargeType !== 'DIRECT_CHARGE') {
      const stripCollection = await checkCollectionByName(projectId, 'stripe_connected_accounts');
      const stripeConnectAccountItems = await list(db, projectId, stripCollection);
      let productConnectedAccounts = [];
      let productConnectedAccountIds = productToPurchase.connectedAccountId
        ? productToPurchase.connectedAccountId
        : [];
      if (!productConnectedAccountIds) {
        productConnectedAccountIds = productToPurchase.connected_account_id
          ? productToPurchase.connected_account_id
          : [];
      }
      if (productConnectedAccountIds && productConnectedAccountIds.length > 0) {
        productConnectedAccounts = stripeConnectAccountItems
          ? stripeConnectAccountItems.filter((collectionItem) =>
              productConnectedAccountIds.includes(collectionItem.uuid),
            )
          : [];
      }

      const productConnectedSingleAccount =
        productConnectedAccounts && productConnectedAccounts.length > 0
          ? productConnectedAccounts[0]
          : '';

      if (chargeType === 'SEPARATE_CHARGE' && doSeparatePayment) {
        if (paymentMode === 'subscription') {
          session = await stripe.checkout.sessions.create({
            // payment_method_types: ['automatic'],
            ...stripeConfig,
            subscription_data: {
              transfer_group: transferGroupId,
            },
          });
        } else {
          session = await stripe.checkout.sessions.create({
            // payment_method_types: ['automatic'],
            ...stripeConfig,
            payment_intent_data: {
              transfer_group: transferGroupId,
            },
          });
        }
      } else {
        const accountId = productConnectedSingleAccount.accountId;
        if (paymentMode === 'subscription') {
          session = await stripe.checkout.sessions.create({
            // payment_method_types: ['automatic'],
            ...stripeConfig,
            subscription_data: {
              transfer_data: {
                destination: accountId,
              },
            },
          });
        } else {
          session = await stripe.checkout.sessions.create({
            // payment_method_types: ['automatic'],
            ...stripeConfig,
            payment_intent_data: {
              transfer_data: {
                destination: accountId,
              },
            },
          });
        }
      }
    } else {
      session = await stripe.checkout.sessions.create({
        // payment_method_types: ['card'],
        ...stripeConfig,
      });
    }
    res.json({
      code: 303,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

export const processWebhook = async (req, res, next) => {
  const { db, projectId, environment } = req;
  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  try {
    const installedStripeConnect = await findInstalledPlugin(projectId, pluginCode.STRIPE_CONNECT);

    if (!installedStripeConnect) {
      return res.json({
        code: 400,
        message: 'Stripe Connect Payment Plugin not installed',
        status: 'failed',
      });
    }
    console.log('==> STRIPE CONNECT processWebhook installedStripeConnect');
    const { setting: pluginSetting } = installedStripeConnect;
    let { webhookSecretKey, secretKey, region, hasConnectedAccount, chargeType, currency } =
      pluginSetting;
    webhookSecretKey = replaceValueFromSource(webhookSecretKey, environment, null);
    secretKey = replaceValueFromSource(secretKey, environment, null);

    const endpointSecret = webhookSecretKey;
    console.log('==> STRIPE CONNECT endpointSecret :>> ');
    if (!endpointSecret) {
      return res.json({
        code: 400,
        message: 'Stripe Webhook Signing Secret key is required',
        status: 'failed',
      });
    }

    const stripe = new Stripe(secretKey);
    let event = req.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      // const signature = req.headers['stripe-signature'];

      const payload = req.body;
      console.log('==> STRIPE CONNECT processWebhook signature :>> ');
      const payloadString = JSON.stringify(payload, null, 2);
      const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: endpointSecret,
      });

      try {
        event = stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
        // event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        console.log('==> STRIPE CONNECT processWebhook checkout completed paymentIntent :>> ');

        const doSeparatePayment = allowedSeparatePaymentRegions.includes(region);
        if (hasConnectedAccount && chargeType === 'SEPARATE_CHARGE' && doSeparatePayment) {
          const collectionName = paymentIntent.metadata.collectionId;
          const itemUuid = paymentIntent.metadata.productId;
          const transferGroupId = paymentIntent.metadata.transfer_group;
          const productAmount = paymentIntent.amount_total;
          console.log('==> STRIPE CONNECT processWebhook  transferGroupId :>> ');
          console.log('==> STRIPE CONNECT processWebhook  productAmount :>> ');

          const collection = await findOneCollectionService(projectId, collectionName);
          if (!collection) {
            return res.json({
              code: 400,
              message: `No collection data has found for ${collectionName}`,
              status: 'failed',
            });
          }
          console.log('==> STRIPE CONNECT processWebhook  collection');
          const productToPurchaseResponse = await getItemToPurchase(
            db,
            projectId,
            collectionName,
            itemUuid,
          );
          //Get Key From DB
          if (!productToPurchaseResponse || productToPurchaseResponse.code === 400) {
            return res.json({
              code: 400,
              message: productToPurchaseResponse.message,
              status: 'failed',
            });
          }
          console.log(
            '==> STRIPE CONNECT processWebhook checkout.session.completed productToPurchaseResponse',
          );
          const productToPurchase = productToPurchaseResponse;
          const stripCollection = await checkCollectionByName(
            projectId,
            'stripe_connected_accounts',
          );

          const stripeConnectAccountItems = await list(db, projectId, stripCollection);

          let productConnectedAccounts = [];

          let productConnectedAccountIds = productToPurchase.connectedAccountId
            ? productToPurchase.connectedAccountId
            : [];
          if (!productConnectedAccountIds) {
            productConnectedAccountIds = productToPurchase.connected_account_id
              ? productToPurchase.connected_account_id
              : [];
          }

          if (productConnectedAccountIds && productConnectedAccountIds.length > 0) {
            productConnectedAccounts = stripeConnectAccountItems
              ? stripeConnectAccountItems.filter((collectionItem) =>
                  productConnectedAccountIds.includes(collectionItem.uuid),
                )
              : [];
          }

          console.log(
            '==>STRIPECONNECT processWebhook checkout completed productConnectAccounts:>>',
          );

          if (productConnectedAccounts && productConnectedAccounts.length > 0) {
            productConnectedAccounts.forEach(async (pca) => {
              const amountPercent = pca.amountPercent;
              const accountId = pca.accountId;
              // Create a Transfer to the connected account (later):
              await stripe.transfers.create({
                amount: productAmount * (amountPercent / 100),
                currency,
                destination: accountId,
                transfer_group: transferGroupId,
              });
              console.log('==> STRIPE CONNECT processWebhook checkout completed transfer :>> ');
            });
          }
        }
        break;
      // ... handle other event types
      default:
        console.log(`==> STRIPE CONNECT processWebhook Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  } catch (error) {
    next(error);
  }
};
