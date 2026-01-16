import express from 'express';
import {
  configureDocusignPassport,
  configureFacebookPassport,
  configureOAuthPassport,
  configureTwitterPassport,
} from '../security/socialAuth';
import {
  docusignAuth,
  docusignCallback,
  facebookCallback,
  loginWithFacebook,
  loginWithOAuth2,
  loginWithTwitter,
  oAuth2Callback,
  twitterCallback,
} from './oauth.controller';
import { paramHandling } from '../middleware/oauth.middleware';
const router = express.Router();

// OAuth 2.0
//Fixed
router.get('/login-oauth2', paramHandling, configureOAuthPassport, loginWithOAuth2);
router.get('/login-oauth2/callback', configureOAuthPassport, oAuth2Callback);

// Facebook
router.get('/auth/facebook', paramHandling, configureFacebookPassport, loginWithFacebook);
router.get('/auth/facebook/callback', paramHandling, configureFacebookPassport, facebookCallback);

// Twitter
router.get('/auth/twitter', paramHandling, configureTwitterPassport, loginWithTwitter);
router.get('/auth/twitter/callback', paramHandling, configureTwitterPassport, twitterCallback);

// Docusign
router.get('/auth/docusign', paramHandling, configureDocusignPassport, docusignAuth);
router.get('/auth/docusign/callback', paramHandling, configureDocusignPassport, docusignCallback);

export default router;
