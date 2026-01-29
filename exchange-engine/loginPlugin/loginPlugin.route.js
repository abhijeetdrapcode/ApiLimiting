import express from 'express';
import {
  addUserWithProvider,
  loginWithProvider,
  resetPassword,
  changePassword,
  loginUserWithToken,
  addAnonymousUser,
  getTenantByTenantId,
  getUserSettingByUserSettingId,
  updateTenantPermission,
  updateUserPermission,
  updateUserSettingsPermission,
  generateAndSendEmailOTP,
  generateAndSendSmsOTP,
  forgetPassword,
  getUserDetails,
  generateEmailOTP,
  generateSmsOTP,
  forceLogoutAllDevices,
  addUserWithMultiTenantFields,
  processCheckToken,
} from './user.controller';
import { validatePasswordMiddleware } from './user.service';
import { verifyJwt } from '../middleware/verifyJWTToken.middleware';

const loginPluginRoute = express.Router();

loginPluginRoute.post('/send-email-otp', generateAndSendEmailOTP);
loginPluginRoute.post('/send-sms-otp', generateAndSendSmsOTP);
loginPluginRoute.post('/logout-all/:userId', verifyJwt, forceLogoutAllDevices);

//Below this verify
loginPluginRoute.post('/user/:provider?', validatePasswordMiddleware, addUserWithProvider);

loginPluginRoute.post('/anonymous-user', validatePasswordMiddleware, addAnonymousUser);
loginPluginRoute.post('/login/:provider?', loginWithProvider);
loginPluginRoute.post('/login-with-token', loginUserWithToken);
loginPluginRoute.post('/forget-password/:templateId', forgetPassword);
loginPluginRoute.post('/reset-password/', verifyJwt, validatePasswordMiddleware, resetPassword);

loginPluginRoute.post('/change-passoword/', verifyJwt, validatePasswordMiddleware, changePassword);
loginPluginRoute.get('/tenant/:tenantId', getTenantByTenantId);
loginPluginRoute.get('/userSetting/:userSettingId', getUserSettingByUserSettingId);
loginPluginRoute.post('/tenant/:tenantId/permissions', verifyJwt, updateTenantPermission);
loginPluginRoute.post('/user/:userId/permissions', verifyJwt, updateUserPermission);
loginPluginRoute.post(
  '/user-settings/:userSettingsId/permissions',
  verifyJwt,
  updateUserSettingsPermission,
);

loginPluginRoute.get('/userDetails/:userUniqueKey', verifyJwt, getUserDetails);
loginPluginRoute.post('/generate-email-otp', generateEmailOTP);
loginPluginRoute.post('/generate-sms-otp', generateSmsOTP);
// User with Multi Tenant Field
loginPluginRoute.post(
  '/create-user-with-multi-tenant-fields',
  validatePasswordMiddleware,
  addUserWithMultiTenantFields,
);
// Check Token
loginPluginRoute.get('/check-token', verifyJwt, processCheckToken);

export default loginPluginRoute;
