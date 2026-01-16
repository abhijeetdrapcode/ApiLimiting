import express from 'express';
import { processCheckout, processWebhook } from './stripeConnect.controller';

const stripeConnectRouter = express.Router();
stripeConnectRouter.post('/process-checkout', processCheckout);
stripeConnectRouter.post('/webhook', express.json({ type: 'application/json' }), processWebhook);

export default stripeConnectRouter;
