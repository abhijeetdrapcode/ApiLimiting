import express from 'express';
import {
  eStatementAnalysis,
  iprsKenya,
  kraPinChecker,
  metropolCreditReport,
} from './spinMobile.controller';
const spinMobileRouter = express.Router();

spinMobileRouter.post('/iprs-kenya', iprsKenya);
spinMobileRouter.post('/credit-report/metropol', metropolCreditReport);
spinMobileRouter.post('/kra-pin-checker', kraPinChecker);
spinMobileRouter.post('/e-statement-analysis', eStatementAnalysis);

export default spinMobileRouter;
