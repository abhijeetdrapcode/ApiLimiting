import express from 'express';
import {
  initiateStkPush,
  mPesaSTKPushCallback,
  initiateB2CPayout,
  mPesaB2CCallback,
  mPesaC2BRegisterUrl,
} from './mPesa.controller';
const mPesaRouter = express.Router();

mPesaRouter.post('/c2b/stkpush', initiateStkPush);
mPesaRouter.post('/c2b/stkcallback', mPesaSTKPushCallback);
mPesaRouter.post('/b2c/initiate', initiateB2CPayout);
mPesaRouter.post('/b2c/result', mPesaB2CCallback);
mPesaRouter.post('/b2c/timeout', mPesaB2CCallback);
mPesaRouter.post('/c2b/register-url', mPesaC2BRegisterUrl);

export default mPesaRouter;
