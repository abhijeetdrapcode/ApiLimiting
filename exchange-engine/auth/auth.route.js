import express from 'express';
import {
  authorizeEmailOTPCode,
  authorizeSecretCode,
  authorizeSmsOTPCode,
  generateSecretCode,
  loginUser,
  loginUserWithExternalAPI,
  loginUserWithToken,
  logoutUser,
  magicLinkLogin,
  refreshLoggedInUser,
  resetSecretCode,
  verifySecretCode,
} from './auth.controller';
const router = express.Router();

// Standard login
router.post('/login/:provider?', loginUser);

//Fixed
router.post('/login/otp/external-api/:collectionItemId?', loginUserWithExternalAPI);
router.post('/login-with-token', loginUserWithToken);
router.get('/auth-with-email', magicLinkLogin);
router.post('/logout', logoutUser);
// User/Session Refresh
router.get('/refresh-user', refreshLoggedInUser);
//Secret Codes/OTP
router.get('/generate-secret-code', generateSecretCode);
router.post('/verify-secret-code', verifySecretCode);
router.post('/authorize-secret-code', authorizeSecretCode);
router.post('/reset-secret-code', resetSecretCode);
router.post('/authorize-email-otp', authorizeEmailOTPCode);
router.post('/authorize-sms-otp', authorizeSmsOTPCode);

export default router;
