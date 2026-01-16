import {
  mPesaB2CCallbackService,
  initiateB2CPayoutService,
  initiateStkPushService,
  mPesaSTKPushCallbackService,
  mPesaC2BRegisterUrlService,
  mPesaC2BConfirmationService,
} from './mPesa.service';
import { prepareMPesaCallbackUrls } from './mPesa.utils';

export const initiateStkPush = async (req, res, next) => {
  try {
    const { body, db, projectId, enableAuditTrail, user, tenant, headers, environment, subTenant } =
      req;
    const { phoneNumberField, amountField, itemId, collection, transactionType } = body;
    const callbackUrl = prepareMPesaCallbackUrls(req.get('host'), 'c2b', 'stkcallback');
    const response = await initiateStkPushService(
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
    );
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    next(error);
  }
};

export const mPesaSTKPushCallback = async (req, res, next) => {
  try {
    const { body, db, projectId, environment, enableAuditTrail, query } = req;
    const response = await mPesaSTKPushCallbackService(
      db,
      projectId,
      environment,
      enableAuditTrail,
      body,
      query,
    );
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in mPesaSTKPushCallback', error);
    next(error);
  }
};

export const initiateB2CPayout = async (req, res, next) => {
  try {
    const { body, db, projectId, enableAuditTrail, user, tenant, headers, environment, subTenant } =
      req;
    const { phoneNumberField, amountField, itemId, collection, transactionType, occasionField } =
      body;
    const timeoutUrl = prepareMPesaCallbackUrls(req.get('host'), 'b2c', 'timeout');
    const resultUrl = prepareMPesaCallbackUrls(req.get('host'), 'b2c', 'result');
    const response = await initiateB2CPayoutService(
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
    );
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in initiateB2CPayout:', error);
    next(error);
  }
};

export const mPesaB2CCallback = async (req, res, next) => {
  try {
    const { body, db, projectId, environment, enableAuditTrail, query } = req;
    const response = await mPesaB2CCallbackService(
      db,
      projectId,
      environment,
      enableAuditTrail,
      body,
      query,
    );
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in mPesaB2CCallback', error);
    next(error);
  }
};

export const mPesaC2BRegisterUrl = async (req, res, next) => {
  try {
    const { db, projectId, environment, enableAuditTrail, user, tenant, headers } = req;
    const confirmationUrl = prepareMPesaCallbackUrls(req.get('host'), 'c2b', 'confirmation');
    const response = await mPesaC2BRegisterUrlService(
      db,
      projectId,
      environment,
      enableAuditTrail,
      user,
      tenant,
      headers,
      confirmationUrl,
    );
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in mPesaC2BRegisterUrl', error);
    next(error);
  }
};

export const mPesaC2BConfirmation = async (req, res) => {
  try {
    const { body, db, projectId, environment, enableAuditTrail } = req;
    const response = await mPesaC2BConfirmationService(
      db,
      projectId,
      environment,
      enableAuditTrail,
      body,
    );
    if (response.code === 200) {
      return res.json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    }
  } catch (error) {
    console.error('Error in mPesaC2BCallback', error);
    return res.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
};
