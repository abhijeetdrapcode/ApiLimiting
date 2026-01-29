import express from 'express';
import { refreshTenantAndLoggedInUser, switchSubTenant, switchTenant } from './tenant.controller';
const router = express.Router();

router.get('/refresh-user-tenant/:tenantId/:userSettingId?', refreshTenantAndLoggedInUser);
router.get('/switch-tenant/:tenantId', switchTenant);
router.get('/switch-sub-tenant/:subTenantId', switchSubTenant);

export default router;
