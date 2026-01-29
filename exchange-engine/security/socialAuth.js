import axios from 'axios';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import OAuth2Strategy from 'passport-oauth2';
import { Strategy as DocusignStrategy } from 'passport-docusign';
import { pluginCode } from 'drapcode-constant';
import { replaceValueFromSource } from 'drapcode-utility';
import {
  fetchUserLoginWithFacebook,
  fetchUserLoginWithOAuth2,
  fetchUserLoginWithTwitter,
  saveDocusignTokens,
} from '../oauth/oauth.service';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';

export const PROVIDER_TYPE = {
  XANO: 'xano',
};

const getSocialLoginCallBackURL = (req, socialApp) =>
  `https://${req.get('host')}/auth/${socialApp}/callback`;

export const getOAuth2CallBackURL = (req) => `https://${req.get('host')}/login-oauth2/callback`;

const authenticateUserWithTwitter = async (req, token, tokenSecret, profile, done, params) => {
  try {
    const result = await fetchUserLoginWithTwitter(req, token, tokenSecret, profile, params);
    const { status } = result;
    if (status !== 200) {
      return done({ error: result.message, status: status, result: result }, null, null);
    } else {
      return done(null, result.data);
    }
  } catch (error) {
    console.log('error :>> ', error);
    return done({ error: error.message, status: 400 }, null, null);
  }
};

export const configureTwitterPassport = async (req, res, next) => {
  const { projectId } = req;
  const params = req.session.twitterParams || '';
  const twitterPlugin = await findInstalledPlugin(projectId, pluginCode.TWITTER_LOGIN);
  if (!twitterPlugin) {
    return res.status(402).json({ message: 'Twitter Login Plugin is not Installed.' });
  }
  const { consumerKey, consumerSecret } = twitterPlugin.setting;
  const callbackURL = getSocialLoginCallBackURL(req, 'twitter');
  const twitterOptions = {
    consumerKey,
    consumerSecret,
    callbackURL,
    includeEmail: true,
  };
  const twitterStrategy = new TwitterStrategy(
    twitterOptions,
    async (token, tokenSecret, profile, done) => {
      console.log('\n Twitter token :>> ', token);
      console.log('\n Twitter tokenSecret :>> ', tokenSecret);
      console.log('\n Twitter profile :>> ', profile);
      await authenticateUserWithTwitter(req, token, tokenSecret, profile, done, params);
    },
  );

  passport.use('twitter', twitterStrategy);

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  next();
};

export const handleDocusign = async (req, accessToken, refreshToken, profile, done, params) => {
  try {
    const result = await saveDocusignTokens(req, accessToken, refreshToken, profile, params);
    const { status } = result;
    if (status !== 200) {
      return done({ error: result.message, status: status, result: result }, null, null);
    } else {
      return done(null, result.data);
    }
  } catch (error) {
    console.log('error :>> ', error);
    return done({ error: error.message, status: 400 }, null, null);
  }
};

export const configureDocusignPassport = async (req, res, next) => {
  const { projectId } = req;
  const params = req.session?.docusignParams || '';
  const docusignPlugin = await findInstalledPlugin(projectId, pluginCode.DOCUSIGN);
  if (!docusignPlugin) {
    return res.status(402).json({ message: 'Docusign Plugin is not Installed.' });
  }
  const { integration_key, secret_key, enviroment } = docusignPlugin.setting;
  let isProduction = false;
  if (enviroment === 'production') {
    isProduction = true;
  }
  console.log({ isProduction });
  const callbackURL = getSocialLoginCallBackURL(req, 'docusign');
  const docusignOptions = {
    clientID: integration_key,
    clientSecret: secret_key,
    callbackURL: callbackURL,
    production: isProduction,
  };
  const docusignStrategy = new DocusignStrategy(docusignOptions, async function (
    accessToken,
    refreshToken,
    profile,
    done,
  ) {
    await handleDocusign(req, accessToken, refreshToken, profile, done, params);
  });

  passport.use('docusign', docusignStrategy);

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  next();
};

export const getOAuthOptionsFromPlugin = async (req) => {
  const { projectId, urlEnv, tenant } = req;
  let pluginOptions = {};
  const oAuth2Plugin = await findInstalledPlugin(projectId, pluginCode.OAUTH_2);
  if (!oAuth2Plugin || !oAuth2Plugin.setting) {
    return { status: 400, message: 'OAuth 2.0 Plugin is not Installed.' };
  }
  const { setting } = oAuth2Plugin;
  let {
    authorizationURL,
    tokenURL,
    clientID,
    clientSecret,
    scope,
    userInfoUrl,
    userUniqueField,
    defaultRole,
  } = setting;

  authorizationURL = replaceValueFromSource(authorizationURL, urlEnv, tenant);
  authorizationURL = authorizationURL.trim();

  tokenURL = replaceValueFromSource(tokenURL, urlEnv, tenant);
  tokenURL = tokenURL.trim();

  clientID = replaceValueFromSource(clientID, urlEnv, tenant);
  clientID = clientID.trim();

  clientSecret = replaceValueFromSource(clientSecret, urlEnv, tenant);
  clientSecret = clientSecret.trim();

  scope = replaceValueFromSource(scope, urlEnv, tenant);
  scope = scope.trim();

  userInfoUrl = replaceValueFromSource(userInfoUrl, urlEnv, tenant);
  userInfoUrl = userInfoUrl.trim();

  userUniqueField = replaceValueFromSource(userUniqueField, urlEnv, tenant);
  userUniqueField = userUniqueField.trim();

  defaultRole = replaceValueFromSource(defaultRole, urlEnv, tenant);
  defaultRole = defaultRole.trim();
  //TODO:
  let callbackURL = getOAuth2CallBackURL(req);
  scope = scope.split(' ');
  pluginOptions = {
    authorizationURL,
    tokenURL,
    clientID,
    clientSecret,
    scope,
    userInfoUrl,
    userUniqueField,
    defaultRole,
    callbackURL,
  };
  if (!scope.length) delete pluginOptions['scope'];
  return pluginOptions;
};

export const configureOAuthPassport = async (req, res, next) => {
  const pluginOptions = await getOAuthOptionsFromPlugin(req);
  const oAuth2Strategy = new OAuth2Strategy(pluginOptions, async function (
    accessToken,
    refreshToken,
    profile,
    done,
  ) {
    console.log('\n refreshToken :>> ', refreshToken);
    console.log('\n profile :>> ', profile);
    await authenticateUserWithOAuth2(req, accessToken, done);
  });
  passport.use('oauth2', oAuth2Strategy);
  passport.serializeUser((user, done) => {
    const userDetailsWithRole = formatUser(user);
    done(null, userDetailsWithRole);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  next();
};

export const configureFacebookPassport = async (req, res, next) => {
  const { projectId } = req;
  const params = req.session.facebookParams || '';
  const facebookPlugin = await findInstalledPlugin(projectId, pluginCode.FACEBOOK_LOGIN);
  if (!facebookPlugin) {
    return res.status(402).json({ message: 'Facebook Login Plugin is not Installed.' });
  }
  const { appID: clientID, appSecret: clientSecret } = facebookPlugin.setting;
  const callbackURL = getSocialLoginCallBackURL(req, 'facebook');
  const facebookOptions = {
    clientID,
    clientSecret,
    callbackURL,
    profileFields: ['id', 'displayName', 'email'],
  };
  const facebookStrategy = new FacebookStrategy(
    facebookOptions,
    async (accessToken, refreshToken, profile, done) => {
      console.log('\n Facebook refreshToken :>> ', refreshToken);
      console.log('\n Facebook profile :>> ', profile);
      await authenticateUserWithFacebook(req, accessToken, refreshToken, profile, done, params);
    },
  );
  passport.use('facebook', facebookStrategy);

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  next();
};

const authenticateUserWithOAuth2 = async (req, accessToken, done) => {
  try {
    const result = await fetchUserLoginWithOAuth2(req, accessToken);
    const { status } = result;
    if (status !== 200) {
      return done({ error: result.message, status: status, result: result }, null, null);
    } else {
      return done(null, result.data);
    }
  } catch (error) {
    return done({ error: error.message, status: 400 }, null, null);
  }
};

const authenticateUserWithFacebook = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done,
  params,
) => {
  try {
    const result = await fetchUserLoginWithFacebook(
      req,
      accessToken,
      refreshToken,
      profile,
      params,
    );
    const { status } = result;
    if (status !== 200) {
      return done({ error: result.message, status: status, result: result }, null, null);
    } else {
      return done(null, result.data);
    }
  } catch (error) {
    console.log('error :>> ', error);
    return done({ error: error.message, status: 400 }, null, null);
  }
};

const formatUser = (user) => {
  const userDetailsWithRole = user.userDetails;
  userDetailsWithRole['role'] = user.role;
  userDetailsWithRole['token'] = user.token;
  // eslint-disable-next-line no-prototype-builtins
  if (user.hasOwnProperty('userSetting')) {
    userDetailsWithRole['userSetting'] = user.userSetting;
  }
  // eslint-disable-next-line no-prototype-builtins
  if (user.hasOwnProperty('tenant')) {
    userDetailsWithRole['tenant'] = user.tenant;
  }
  // eslint-disable-next-line no-prototype-builtins
  if (user.hasOwnProperty('subTenant')) {
    userDetailsWithRole['subTenant'] = user.subTenant;
  }
  return userDetailsWithRole;
};

export const signUpWithXano = async (environment, setting, authData) => {
  let { api_url, app_id } = setting;
  api_url = replaceValueFromSource(api_url, environment, null);
  app_id = replaceValueFromSource(app_id, environment, null);

  const url = `${api_url}:${app_id}/auth/signup`;
  try {
    const { data } = await axios.post(url, authData);
    const userRsponse = await checkUserDetailFromXano(environment, setting, data.authToken);
    return { success: true, data: { ...data, ...userRsponse.data } };
  } catch (error) {
    return parseError(error);
  }
};

export const checkUserDetailFromXano = async (environment, setting, token) => {
  let { api_url, app_id } = setting;
  api_url = replaceValueFromSource(api_url, environment, null);
  app_id = replaceValueFromSource(app_id, environment, null);

  const url = `${api_url}:${app_id}/auth/me`;
  try {
    const { data } = await axios.get(url, { headers: { Authorization: token } });
    return { success: true, data };
  } catch (error) {
    return parseError(error);
  }
};

export const signInWithXano = async (environment, setting, username, password) => {
  let { api_url, app_id } = setting;
  api_url = replaceValueFromSource(api_url, environment, null);
  app_id = replaceValueFromSource(app_id, environment, null);

  const url = `${api_url}:${app_id}/auth/login`;
  try {
    const { data } = await axios.post(url, { email: username, password });
    const userRsponse = await checkUserDetailFromXano(setting, data.authToken);
    return { success: true, data: { ...data, ...userRsponse.data } };
  } catch (error) {
    return parseError(error);
  }
};

const parseError = (errorResponse) => {
  if (!errorResponse) {
    return { status: 400, message: 'Error', success: false };
  }
  const { response } = errorResponse;
  if (!response) {
    return { status: 400, message: 'Error', success: false };
  }
  const { data, status } = response;
  if (!data) {
    return { status: status ? status : 400, message: 'Error', success: false };
  }

  const { message, payload } = data;
  let param = '';
  if (payload) {
    param = payload.param;
  }
  return {
    success: false,
    status: status ? status : 400,
    message: `${param !== undefined && param ? `${param} :` : ''}${message}`,
  };
};
