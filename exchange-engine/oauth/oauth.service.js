import { pluginCode } from 'drapcode-constant';
import { getOAuthOptionsFromPlugin } from '../security/socialAuth';
import {
  cleanUserItem,
  getUserFromFacebookAccessToken,
  getUserFromOAuthAccessToken,
  getUserFromTwitterAccessToken,
} from '../loginPlugin/user.service';
import { checkCollectionByName, userCollectionService } from '../collection/collection.service';
import {
  extractFirstSubTenantIdFromUserAndTenantId,
  extractFirstTenantIdFromUser,
  extractUserSettingFromUserAndTenant,
  getSubTenantById,
  getTenantById,
} from '../tenant/tenant.service';
import { handleMultiTenantLoginProcess, processUserWithPLS } from '../security/loginUtils';
import { getTokenExpireTime, issueJWTToken } from '../security/jwtUtils';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
import { pluginNotInstalledMessage } from '../utils/appUtils';
import { saveItem } from '../item/item.service';
import { executeLastRecordBuilder } from '../item/item.builder.service';

export const fetchUserLoginWithFacebook = async (
  req,
  accessToken,
  refreshToken,
  profile,
  params,
) => {
  const { db, projectId, enableAuditTrail, environment } = req;

  let paramsObj = atob(params);
  paramsObj = JSON.parse(paramsObj);
  const {
    type,
    successRedirectRules,
    role,
    successRedirectUrl,
    errorRedirectUrl,
    successMessage,
    errorMessage,
  } = paramsObj;

  const facebookLoginPlugin = await findInstalledPlugin(projectId, pluginCode.FACEBOOK_LOGIN);
  if (!facebookLoginPlugin) return pluginNotInstalledMessage('Facebook Login');

  const user = await getUserFromFacebookAccessToken(
    db,
    projectId,
    enableAuditTrail,
    facebookLoginPlugin.setting,
    accessToken,
    role,
    type,
  );
  const eventConfig = {
    type,
    role,
    successRedirectUrl,
    errorRedirectUrl,
    successMessage,
    errorMessage,
    successRedirectRules,
  };

  if (user.error)
    return { status: user.status, data: { projectId, eventConfig, error: user.error } };

  if (user) {
    let finalData = {};
    let userDetails = null;
    let role = user.role;
    userDetails = user.user;
    userDetails = cleanUserItem(userDetails);
    const userCollection = await userCollectionService(projectId);
    if (!userCollection) {
      return { code: 404, message: 'User collection not found' };
    }
    const { permissionLevelSecurity } = userCollection || {};
    const tenantId = extractFirstTenantIdFromUser(userDetails);
    const tenant = await getTenantById(db, projectId, tenantId);
    const userSetting = await extractUserSettingFromUserAndTenant(
      db,
      projectId,
      userDetails,
      tenant,
    );
    const subTenantId = await extractFirstSubTenantIdFromUserAndTenantId(
      db,
      projectId,
      userDetails,
      tenantId,
    );
    const subTenant = await getSubTenantById(db, projectId, subTenantId);
    if (tenant) {
      await handleMultiTenantLoginProcess(db, userDetails, role, tenant, subTenant, userSetting);
    }
    delete user.role;
    const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
    const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);

    // Filter the user object to only include specified fields based on permission level security
    userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);
    console.log('loginUserWithFacebook');
    finalData = {
      userDetails,
      role,
      tenant,
      userSetting,
      subTenant,
      projectId,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      eventConfig,
    };
    return { status: 200, data: finalData };
  }
};

export const fetchUserLoginWithTwitter = async (
  req,
  accessToken,
  refreshToken,
  profile,
  params,
) => {
  //   const body = { params, accessToken, refreshToken, profile };
  const { db, projectId, enableAuditTrail, environment } = req;
  let paramsObj = atob(params);
  paramsObj = JSON.parse(paramsObj);
  const {
    type,
    successRedirectRules,
    role,
    successRedirectUrl,
    errorRedirectUrl,
    successMessage,
    errorMessage,
  } = paramsObj;

  const twitterLoginPlugin = await findInstalledPlugin(projectId, pluginCode.TWITTER_LOGIN);
  if (!twitterLoginPlugin) return pluginNotInstalledMessage('Twitter Login');
  const user = await getUserFromTwitterAccessToken(
    db,
    projectId,
    enableAuditTrail,
    twitterLoginPlugin.setting,
    profile,
    role,
    type,
  );

  const eventConfig = {
    type,
    role,
    successRedirectUrl,
    errorRedirectUrl,
    successMessage,
    errorMessage,
    successRedirectRules,
  };
  if (user.error)
    return { status: user.status, data: { projectId, eventConfig, error: user.error } };

  if (user) {
    let finalData = {};
    let userDetails = null;
    let role = user.role;
    userDetails = user.user;
    userDetails = cleanUserItem(userDetails);
    const userCollection = await userCollectionService(projectId);
    if (!userCollection) {
      return { code: 404, message: 'User collection not found' };
    }
    const { permissionLevelSecurity } = userCollection || {};
    const tenantId = extractFirstTenantIdFromUser(userDetails);
    const tenant = await getTenantById(db, projectId, tenantId);
    const userSetting = await extractUserSettingFromUserAndTenant(
      db,
      projectId,
      userDetails,
      tenant,
    );
    const subTenantId = await extractFirstSubTenantIdFromUserAndTenantId(
      db,
      projectId,
      userDetails,
      tenantId,
    );
    const subTenant = await getSubTenantById(db, projectId, subTenantId);
    if (tenant) {
      await handleMultiTenantLoginProcess(db, userDetails, role, tenant, subTenant, userSetting);
    }
    delete user.role;
    const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
    const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);

    // Filter the user object to only include specified fields based on permission level security
    userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);
    console.log('loginUserWithTwitter');
    finalData = {
      ...finalData,
      userDetails,
      role,
      tenant,
      userSetting,
      subTenant,
      projectId,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      eventConfig,
    };
    return { status: 200, data: finalData };
  }
};

export const saveDocusignTokens = async (req, accessToken, refreshToken, profile, params) => {
  const { db, projectId, environment, enableAuditTrail, user, decrypt, headers } = req;
  const collectionName = 'docusign_tokens';

  const collection = await checkCollectionByName(projectId, collectionName);
  if (!collection) {
    return {
      status: 404,
      message: 'Collection not found with provided name',
      error: 'Collection not found with provided name',
    };
  }

  let paramsObj = atob(params);
  paramsObj = JSON.parse(paramsObj);

  const { successRedirectUrl, errorRedirectUrl, successMessage, errorMessage } = paramsObj;
  const tokens = {
    authorizationToken: accessToken,
    refreshToken: refreshToken,
  };
  let finalData = {};
  const eventConfig = {
    successRedirectUrl,
    errorRedirectUrl,
    successMessage,
    errorMessage,
  };

  try {
    const lastItem = await executeLastRecordBuilder(db, collectionName);
    if (lastItem?.length) await db.dropCollection(collectionName);

    await saveItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      collection,
      tokens,
      user,
      headers,
      decrypt,
    );
    finalData = {
      projectId,
      eventConfig,
      profile,
    };
    return { status: 200, data: finalData };
  } catch (error) {
    console.error('Error saving token:', error.response ? error.response.data : error.message);
    return { status: 400, message: error.response ? error.response.data : error.message };
  }
};

export const fetchUserLoginWithOAuth2 = async (req, accessToken) => {
  const { db, projectId, session, environment, enableAuditTrail } = req;
  const oAuth2Params = session.oAuth2Params;

  let paramsObj = atob(oAuth2Params);
  paramsObj = JSON.parse(paramsObj);

  const {
    type,
    successRedirectRules,
    role,
    successRedirectUrl,
    errorRedirectUrl,
    successMessage,
    errorMessage,
  } = paramsObj;

  const pluginOptions = await getOAuthOptionsFromPlugin(req);
  const user = await getUserFromOAuthAccessToken(
    db,
    projectId,
    enableAuditTrail,
    pluginOptions,
    accessToken,
    role,
    type,
  );

  const eventConfig = {
    type,
    role,
    successRedirectUrl,
    errorRedirectUrl,
    successMessage,
    errorMessage,
    successRedirectRules,
  };

  if (user.error) return { status: 200, data: { projectId, eventConfig, error: user.error } };

  let finalData = { oAuthAccessToken: accessToken };
  let userDetails = null;
  let userRole = user.role;
  userDetails = user.user;
  userDetails = cleanUserItem(userDetails);
  const userCollection = await userCollectionService(projectId);
  if (!userCollection) {
    return { status: 404, message: 'User collection not found' };
  }
  const { permissionLevelSecurity } = userCollection || {};
  const tenantId = extractFirstTenantIdFromUser(userDetails);
  const tenant = await getTenantById(db, projectId, tenantId);
  const userSetting = await extractUserSettingFromUserAndTenant(db, projectId, userDetails, tenant);
  const subTenantId = await extractFirstSubTenantIdFromUserAndTenantId(
    db,
    projectId,
    userDetails,
    tenantId,
  );
  const subTenant = await getSubTenantById(db, projectId, subTenantId);
  if (tenant) {
    await handleMultiTenantLoginProcess(db, userDetails, userRole, tenant, subTenant, userSetting);
  }
  delete user.role;
  const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
  const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);

  // Filter the user object to only include specified fields based on permission level security
  userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);
  finalData = {
    ...finalData,
    userDetails,
    role: userRole,
    tenant,
    userSetting,
    subTenant,
    projectId,
    token: tokenObject.token,
    expiresIn: tokenObject.expires,
    eventConfig,
  };
  return { status: 200, data: finalData };
};
