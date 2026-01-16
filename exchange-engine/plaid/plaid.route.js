import express from 'express';
import { createLinkToken, setAccessToken } from './plaid.controller';

const plaidRouter = express.Router();
plaidRouter.post('/create-link-token', createLinkToken);
plaidRouter.post('/set-access-token', setAccessToken);
export default plaidRouter;
