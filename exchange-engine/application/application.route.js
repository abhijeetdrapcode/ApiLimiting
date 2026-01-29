import express from 'express';
import pageRouter from '../page/page.route';
import authRouter from '../auth/auth.route';
import oauthRouter from '../oauth/oauth.route';
import tenantRouter from '../tenant/tenant.route';
import proxyRouter from '../proxy/proxy.route';
import seoRouter from '../seo/seo.route';
const applicationRouter = express.Router();

applicationRouter.use('/', authRouter);
applicationRouter.use('/', oauthRouter);
applicationRouter.use('/', tenantRouter);
applicationRouter.use('/', seoRouter);
applicationRouter.use('/', pageRouter);
applicationRouter.use('/', proxyRouter);

export default applicationRouter;
