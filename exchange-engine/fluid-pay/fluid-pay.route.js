import express from 'express';
import { createFluidPayToken, processFluidPayToken } from './fluid-pay.controller';

const fluidPayRouter = express.Router();
fluidPayRouter.post('/api-key', createFluidPayToken);
fluidPayRouter.post('/process-payment', processFluidPayToken);
export default fluidPayRouter;
