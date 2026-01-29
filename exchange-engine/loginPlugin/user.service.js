import { pluginCode } from 'drapcode-constant';
import { generateUsername } from 'unique-username-generator';
import {
  checkCollectionByName,
  encRefFieldCollections,
  findOneCollectionService,
  multiTenantCollService,
  subTenantCollService,
  userCollectionService,
  userSettingCollService,
} from '../collection/collection.service';
import {
  convertPasswordTypeFields,
  convertSingleItemToList,
  validateItemCollection,
  convertStringDataToObject,
  convertAutoGenerateTypeFields,
  findOneItemByQuery,
  findItemById,
  saveCollectionItem,
  updateCollectionItem,
  removeItemById,
} from '../item/item.service';
import { v4 as uuidv4 } from 'uuid';
import {
  compareBcryptPassword,
  handleMultiTenantLoginProcess,
  processUserWithPLS,
  roleCollectionName,
  updatePermissions,
  userCollectionName,
} from '../security/loginUtils';
import { customInsertOne, preparePluginCredentials } from '../utils/utils';
import {
  findInstalledPlugin,
  loadSESPluginConfig,
} from '../install-plugin/installedPlugin.service';
import _, { isArray } from 'lodash';
import axios from 'axios';
import {
  formatFieldsOfItem,
  processItemEncryptDecrypt,
  replaceValueFromSource,
  validateEmail,
} from 'drapcode-utility';
import { findTemplate } from '../email-template/template.service';
import {
  handleEmailActivityTrackers,
  replaceFieldsIntoTemplate,
  sendEmailUsingResend,
  sendEmailUsingSendGrid,
  sendEmailUsingSes,
} from '../email/email.service';
import { getTokenExpireTime, issueJWTToken } from '../security/jwtUtils';

import { createAuditTrail } from '../logs/audit/audit.service';
import { collectionNotFoundMessage, isNew, pluginNotInstalledMessage } from '../utils/appUtils';
import { getProjectEncryption } from '../project/project.service';
import voca from 'voca';
import { cryptService } from '../middleware/encryption.middleware';
import {
  extractFirstSubTenantIdFromUserAndTenantId,
  extractFirstTenantIdFromUser,
  extractUserSettingFromUserAndTenant,
  getSubTenantById,
  getTenantById,
} from '../tenant/tenant.service';
import { PROVIDER_TYPE, signUpWithXano } from '../security/socialAuth';
import { handleSmsActivityTrackers, validatePhoneNumber } from '../sms/sms.utils';
const Chance = require('chance');
const chance = new Chance();
const DUMMY_EMAIL_DOMAIN = '@email.com';
const MAX_ATTEMPTS = 3; // Maximum failed attempts allowed
const COOLDOWN_PERIOD = 15 * 60 * 1000; // 15 minutes cooldown

export const saveUser = async (
  dbConnection,
  projectId,
  enableAuditTrail,
  userData,
  isNewPhoneSignUp = false,
) => {
  const collectionData = await checkCollectionByName(projectId, userCollectionName);
  if (!collectionData) {
    return { code: 404, data: `Collection not found with provided name` };
  }

  validateUserData(collectionData, userData);
  userData.password = userData.password ? userData.password : generateTemporaryPassword();
  console.log('==> saveUser userData :>> ', userData);
  const errorJson = await validateItemCollection(
    dbConnection,
    collectionData,
    userData,
    null,
    false,
    false,
    isNewPhoneSignUp,
  );
  console.error('errorJson saveUser', errorJson);
  if (Object.keys(errorJson).length !== 0) {
    if (errorJson.field)
      return {
        code: 409,
        message: 'Validation Failed',
        data: errorJson.field,
      };
  } else {
    userData = await convertAutoGenerateTypeFields(
      dbConnection,
      projectId,
      collectionData,
      userData,
    );
    userData = await convertPasswordTypeFields(dbConnection, projectId, collectionData, userData);
    userData = await convertSingleItemToList(collectionData, userData);
    userData = await convertStringDataToObject(collectionData, userData);
    userData.createdAt = new Date();
    userData.updatedAt = new Date();
    if (!_.get(userData, 'uuid')) {
      userData.uuid = uuidv4();
    }

    let dbCollection = await dbConnection.collection(userCollectionName);
    // FINAL: START:Audit Trail
    createAuditTrail(
      dbConnection,
      enableAuditTrail,
      'NORMAL',
      'create',
      '',
      userCollectionName,
      userData,
    );
    // END:Audit Trail
    const savedItem = await customInsertOne(dbCollection, userData);
    // eslint-disable-next-line no-prototype-builtins
    if (savedItem) {
      await copyPermissionsInUser(dbConnection, enableAuditTrail, savedItem);
    }

    return {
      code: 201,
      message: 'Item Created Successfully',
      data: savedItem ? savedItem : {},
    };
  }
};

export const saveUserWithProvider = async (
  dbConnection,
  projectId,
  enableAuditTrail,
  userData,
  provider,
  environment,
) => {
  const collectionData = await checkCollectionByName(projectId, userCollectionName);
  if (!collectionData) {
    return { code: 404, data: `Collection not found with provided name` };
  }

  validateUserData(collectionData, userData);
  userData.password = userData.password ? userData.password : generateTemporaryPassword();
  console.log('==> saveUserWithProvider userData :>> ', userData);
  const errorJson = await validateItemCollection(
    dbConnection,
    collectionData,
    userData,
    null,
    false,
  );
  if (Object.keys(errorJson).length !== 0 && errorJson.field) {
    return {
      code: 409,
      message: 'Validation Failed',
      data: errorJson.field,
    };
  }

  let role = '';
  if (userData.userRoles && userData.userRoles.length > 0) {
    let roleName = isArray(userData.userRoles) ? userData.userRoles[0] : userData.userRoles;
    role = await findOneItemByQuery(dbConnection, roleCollectionName, {
      name: roleName,
    });
  }

  if (!role || role.length === 0) {
    return {
      code: 409,
      message: 'Validation Failed',
      data: 'The provided role does not exist. Please verify and try again.',
    };
  }
  delete userData.tenantRoleMapping;

  let extraDocument = {};
  let uuid = '';
  if (provider) {
    let authResponse = await processAuthSignup(projectId, provider, userData, environment);
    if (!authResponse.success) {
      return {
        code: authResponse.status,
        message: authResponse.message,
        data: authResponse.message,
      };
    }

    if (provider === PROVIDER_TYPE.XANO) {
      const { authToken, id, name } = authResponse.data;
      extraDocument = { authToken };
      if (name) {
        extraDocument = { ...extraDocument, name };
      }
      uuid = id;
    }
  } else {
    uuid = uuidv4();
  }

  userData = await convertAutoGenerateTypeFields(dbConnection, projectId, collectionData, userData);

  //Encrypt Record here
  userData = await encryptUser(projectId, collectionData, userData);

  userData = await convertPasswordTypeFields(dbConnection, projectId, collectionData, userData);
  userData = await convertSingleItemToList(collectionData, userData);
  userData = await convertStringDataToObject(collectionData, userData);
  userData.createdAt = new Date();
  userData.updatedAt = new Date();
  userData.uuid = uuid;

  userData = { ...userData, ...extraDocument };

  let dbCollection = await dbConnection.collection(userCollectionName);
  // FINAL: START:Audit Trail
  createAuditTrail(
    dbConnection,
    enableAuditTrail,
    'NORMAL',
    'create',
    '',
    userCollectionName,
    userData,
  );
  // END:Audit Trail

  const savedItem = await customInsertOne(dbCollection, userData);
  // eslint-disable-next-line no-prototype-builtins
  if (savedItem) {
    await copyPermissionsInUser(dbConnection, enableAuditTrail, savedItem);
  }

  return {
    code: 201,
    message: 'Item Created Successfully',
    data: savedItem ? savedItem : {},
  };
};

export const saveAnonymousUser = async (dbConnection, projectId, enableAuditTrail, userData) => {
  const collectionData = await checkCollectionByName(projectId, userCollectionName);
  if (!collectionData) {
    return { code: 404, data: `Collection not found with provided name` };
  }

  if (!userData.userName || userData.userName === 'anonymous-user-login') {
    userData.userName = generateUsername('', 4);
  }
  validateUserData(collectionData, userData);
  userData.password = userData.password ? userData.password : generateTemporaryPassword();
  console.log('==> saveAnonymousUser userData :>> ', userData);
  const errorJson = await validateItemCollection(
    dbConnection,
    collectionData,
    userData,
    null,
    false,
  );
  console.error('errorJson', errorJson);
  if (Object.keys(errorJson).length !== 0 && errorJson.field) {
    return {
      code: 409,
      message: 'Validation Failed',
      data: errorJson.field,
    };
  }

  let role = '';
  if (userData.userRoles && userData.userRoles.length > 0) {
    let roleName = isArray(userData.userRoles) ? userData.userRoles[0] : userData.userRoles;
    role = await findOneItemByQuery(dbConnection, roleCollectionName, {
      name: roleName,
    });
  }
  if (!role || role.length === 0) {
    return {
      code: 409,
      message: 'Validation Failed',
      data: 'The provided role does not exist. Please verify and try again.',
    };
  }

  let extraDocument = {};
  let uuid = uuidv4();
  userData = await convertAutoGenerateTypeFields(dbConnection, projectId, collectionData, userData);

  //Encrypt Record here
  userData = await encryptUser(projectId, collectionData, userData);

  userData = await convertPasswordTypeFields(dbConnection, projectId, collectionData, userData);
  userData = await convertSingleItemToList(collectionData, userData);
  userData = await convertStringDataToObject(collectionData, userData);
  userData.createdAt = new Date();
  userData.updatedAt = new Date();
  userData.uuid = uuid;

  userData = { ...userData, ...extraDocument };

  let dbCollection = await dbConnection.collection(userCollectionName);
  // FINAL: START:Audit Trail
  createAuditTrail(
    dbConnection,
    enableAuditTrail,
    'NORMAL',
    'create',
    '',
    userCollectionName,
    userData,
  );
  // END:Audit Trail
  const savedItem = await customInsertOne(dbCollection, userData);
  // eslint-disable-next-line no-prototype-builtins
  if (savedItem) {
    await copyPermissionsInUser(dbConnection, enableAuditTrail, savedItem);
  }

  return {
    code: 201,
    message: 'Item Created Successfully',
    data: savedItem ? savedItem : {},
  };
};

const processAuthSignup = async (projectId, provider, userData, environment) => {
  let authData = null;
  let authResponse = null;
  let providerCode = '';
  switch (provider) {
    case PROVIDER_TYPE.XANO:
      providerCode = pluginCode.LOGIN_WITH_XANO;
      break;
    default:
      providerCode = '';
      break;
  }
  if (!providerCode) {
    return { success: false, status: 405, message: 'No provider found' };
  }

  const plugin = await findInstalledPlugin(projectId, providerCode);

  if (!plugin) {
    return { success: false, status: 405, message: 'Provider Plugin is not installed' };
  }

  if (provider === PROVIDER_TYPE.XANO) {
    authData = { email: userData.userName, password: userData.password };
    authResponse = await signUpWithXano(environment, plugin.setting, authData);
  }
  return authResponse;
};

export const validateUserData = (collectionData, userData) => {
  let { fields } = collectionData ? collectionData : '';
  const requireFields = fields ? fields.filter((field) => field.required) : [];

  const validFieldNames = new Set(fields ? fields.map((field) => field.fieldName) : []);
  Object.keys(userData).forEach((key) => {
    if (!validFieldNames.has(key)) {
      delete userData[key];
    }
  });

  for (const field of requireFields) {
    if (!userData[`${field.fieldName}`]) {
      //Handling the missing required fields
      if (field.fieldName === 'userName') {
        if (!userData['userName']) {
          let usernameFieldValue = '';
          if (userData && userData['email']) {
            usernameFieldValue = userData['email'];
            userData['userName'] = usernameFieldValue;
          } else if (userData && userData['phone_number']) {
            usernameFieldValue = userData['phone_number'];
            if (userData['phone_number'].includes('+')) {
              usernameFieldValue = userData['phone_number'].split('+')[1];
            }
            userData['userName'] = usernameFieldValue;
          }
        }
      } else if (field.fieldName === 'email') {
        if (!userData['email']) {
          let emailFieldValue = '';
          if (userData && userData['userName']) {
            emailFieldValue = userData['userName'];
            if (!userData['userName'].includes('@')) {
              emailFieldValue += DUMMY_EMAIL_DOMAIN;
            }
            userData['email'] = emailFieldValue;
          } else if (userData && userData['phone_number']) {
            emailFieldValue = userData['phone_number'];
            if (userData['phone_number'].includes('+')) {
              emailFieldValue = userData['phone_number'].split('+')[1];
            }
            if (!userData['phone_number'].includes('@')) {
              emailFieldValue += DUMMY_EMAIL_DOMAIN;
            }
            userData['email'] = emailFieldValue;
          }
        }
      }
    }
  }
};

export const updateTenantPermissionsService = async (
  dbConnection,
  projectId,
  enableAuditTrail,
  tenantId,
  permissions,
) => {
  if (!tenantId) {
    return null;
  }

  const collectionData = await multiTenantCollService(projectId);
  if (!collectionData) {
    return null;
  }

  let tenant = null;
  const query = { uuid: tenantId };
  const collectionName = collectionData.collectionName.toString().toLowerCase();
  let dbCollection = await dbConnection.collection(collectionName);

  tenant = await dbCollection.findOne(query);
  const tenantPermission = updatePermissions(tenant.permissions || [], permissions);

  let newValues = { $set: { permissions: tenantPermission } };
  //FINAL: START:Audit Trail
  const collItem = await dbCollection.find(query);
  createAuditTrail(
    dbConnection,
    enableAuditTrail,
    'NORMAL',
    'update',
    '',
    collectionName,
    { permissions: tenantPermission },
    { permissions: collItem['permissions'] },
  );
  // END:Audit Trail

  let data = await dbCollection.findOneAndUpdate(query, newValues, isNew);
  if (!data || (data.lastErrorObject && !data.lastErrorObject.updatedExisting)) {
    return { code: 404, message: 'Item not found with provided id', data: {} };
  }
  tenant = await findItemById(dbConnection, projectId, collectionData, tenantId, null);
  tenant = tenant && tenant.data ? tenant.data : '';

  return tenant;
};
export const updateUserPermissionsService = async (
  dbConnection,
  projectId,
  enableAuditTrail,
  userId,
  permissions,
) => {
  if (!userId) {
    return null;
  }
  let user = null;
  const query = { uuid: userId };
  let dbCollection = await dbConnection.collection(userCollectionName);

  user = await dbCollection.findOne(query);
  const userPermissions = updatePermissions(user.permissions || [], permissions);
  let newValues = { $set: { permissions: userPermissions } };
  // FINAL: START:Audit Trail
  const collItem = await dbCollection.findOne(query);
  createAuditTrail(
    dbConnection,
    enableAuditTrail,
    'NORMAL',
    'update',
    '',
    userCollectionName,
    { permissions: userPermissions },
    { permissions: collItem['permissions'] },
  );
  // END:Audit Trail

  let data = await dbCollection.findOneAndUpdate(query, newValues, isNew);
  if (!data || (data.lastErrorObject && !data.lastErrorObject.updatedExisting)) {
    return { code: 404, message: 'Item not found with provided id', data: {} };
  }
  return user;
};

export const updateUserSettingsPermissionsService = async (
  dbConnection,
  projectId,
  enableAuditTrail,
  userSettingId,
  permissions,
) => {
  let userSetting = null;
  if (!userSettingId) {
    return null;
  }

  const collectionData = await multiTenantCollService(projectId);
  if (!collectionData) {
    return null;
  }

  const query = { uuid: userSettingId };
  const collectionName = collectionData.collectionName.toString().toLowerCase();
  let dbCollection = await dbConnection.collection(collectionName);

  userSetting = await dbCollection.findOne(query);
  const settingPermission = updatePermissions(userSetting.permissions || [], permissions);
  let newValues = { $set: { permissions: settingPermission } };

  // FINAL: START:Audit Trail
  const collItem = await dbCollection.findOne(query);
  createAuditTrail(
    dbConnection,
    enableAuditTrail,
    'NORMAL',
    'update',
    '',
    collectionName,
    { permissions: settingPermission },
    { permissions: collItem['permissions'] },
  );
  // END:Audit Trail
  let data = await dbCollection.findOneAndUpdate(query, newValues, isNew);
  if (!data || (data.lastErrorObject && !data.lastErrorObject.updatedExisting)) {
    return { code: 404, message: 'Item not found with provided id', data: {} };
  }
  userSetting = await findItemById(dbConnection, projectId, collectionData, userSettingId, null);
  userSetting = userSetting && userSetting.data ? userSetting.data : '';
  return userSetting;
};

export const copyPermissionsInUser = async (dbConnection, enableAuditTrail, user) => {
  try {
    if (!user) {
      return user;
    }

    const { userRoles, uuid } = user;

    let role = '';
    if (userRoles && userRoles.length > 0) {
      let roleName = isArray(userRoles) ? userRoles[0] : userRoles;
      role = await findOneItemByQuery(dbConnection, roleCollectionName, {
        name: roleName,
      });
    }

    if (!role) {
      return user;
    }

    let rolePermissions = role.permissions;
    if (!rolePermissions || rolePermissions.length === 0) {
      return user;
    }

    const query = { uuid };
    let dbCollection = await dbConnection.collection(userCollectionName);
    let newValues = { $set: { permissions: rolePermissions } };
    // FINAL: START:Audit Trail
    const collItem = await dbCollection.findOne(query);
    createAuditTrail(
      dbConnection,
      enableAuditTrail,
      'NORMAL',
      'update',
      '',
      userCollectionName,
      { permissions: rolePermissions },
      { permissions: collItem['permissions'] },
    );
    // END:Audit Trail
    let data = await dbCollection.findOneAndUpdate(query, newValues, isNew);

    return data;
  } catch (error) {
    console.error('error', error);
  }
};

export const getUserFromOAuthAccessToken = async (
  db,
  projectId,
  enableAuditTrail,
  pluginOptions,
  accessToken,
  authUserRole,
  type,
) => {
  const userCollection = await userCollectionService(projectId);
  if (!userCollection) {
    return { code: 404, message: 'User collection not found' };
  }
  const { userInfoUrl, userUniqueField, defaultRole } = pluginOptions;
  if (type === 'SIGNUP' && !authUserRole) {
    let signUpRole = await findOneItemByQuery(db, roleCollectionName, {
      uuid: defaultRole,
    });
    authUserRole = signUpRole ? signUpRole.name : authUserRole;
  }
  const userInfoResponse = await axios.get(userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const authUser = userInfoResponse.data;
  const uniqueId = authUser[userUniqueField];
  const authEmail = authUser['email'];
  let emailQuery = '';
  if (authEmail)
    emailQuery = {
      $regex: new RegExp(`^${authEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    };
  const query = {
    $or: [{ email: emailQuery }, { userName: emailQuery }, { userName: uniqueId }],
  };
  // let user = await findOneItemByQuery(db, userCollectionName, query);
  let { data: user } = await findItemById(db, projectId, userCollection, null, query);
  if (!user) {
    if (type === 'LOGIN')
      return { status: 404, error: { message: `User doesn't exist. Please Sign up First.` } };
    const newUser = {
      email: validateEmail(authEmail) ? authEmail : '',
      userName: authEmail || uniqueId,
      uuid: uuidv4(),
      password: generateTemporaryPassword(),
      userRoles: authUserRole,
    };
    const userResponse = await saveUser(db, projectId, enableAuditTrail, newUser);
    user = userResponse.data;
  }
  let role = '';
  if (user.userRoles && user.userRoles.length > 0) {
    role = await findOneItemByQuery(db, roleCollectionName, {
      name: user.userRoles[0],
    });
  }
  let result = { status: 200, accessToken, user, role: role ? role.uuid : '', error: null };
  return result;
};

export const getUserFromFacebookAccessToken = async (
  db,
  projectId,
  enableAuditTrail,
  pluginOptions,
  accessToken,
  authUserRole,
  type,
) => {
  const userCollection = await userCollectionService(projectId);
  if (!userCollection) {
    return { code: 404, message: 'User collection not found' };
  }
  const { defaultRole } = pluginOptions;
  if (type === 'SIGNUP' && !authUserRole) {
    let signUpRole = await findOneItemByQuery(db, roleCollectionName, {
      uuid: defaultRole,
    });
    authUserRole = signUpRole ? signUpRole.name : authUserRole;
  }

  const userInfoResponse = await axios.get('https://graph.facebook.com/me', {
    params: {
      fields: 'id,name,email',
      access_token: accessToken,
    },
  });

  const authUser = userInfoResponse.data;
  const uniqueId = authUser.id;
  const authEmail = authUser.email;
  const query = {
    $or: [{ email: { $regex: `^${authEmail}$`, $options: 'i' } }, { uuid: uniqueId }],
  };
  // let user = await findOneItemByQuery(db, userCollectionName, query);
  let { data: user } = await findItemById(db, projectId, userCollection, null, query);
  if (!user) {
    if (type === 'LOGIN') {
      return { status: 404, error: { message: `User doesn't exist. Please Sign up First.` } };
    }

    const newUser = {
      email: validateEmail(authEmail) ? authEmail : '',
      userName: authEmail,
      uuid: uniqueId,
      password: generateTemporaryPassword(),
      userRoles: [authUserRole],
    };

    const userResponse = await saveUser(db, projectId, enableAuditTrail, newUser);
    user = userResponse.data;
  }

  let role = '';
  if (user.userRoles && user.userRoles.length > 0) {
    role = await findOneItemByQuery(db, roleCollectionName, {
      name: user.userRoles[0],
    });
  }

  let result = { status: 200, accessToken, user, role: role ? role.uuid : '', error: null };
  return result;
};

export const getUserFromTwitterAccessToken = async (
  db,
  projectId,
  enableAuditTrail,
  pluginOptions,
  profile,
  authUserRole,
  type,
) => {
  const userCollection = await userCollectionService(projectId);
  if (!userCollection) {
    return { code: 404, message: 'User collection not found' };
  }
  const { defaultRole } = pluginOptions;
  if (type === 'SIGNUP' && !authUserRole) {
    let signUpRole = await findOneItemByQuery(db, roleCollectionName, {
      uuid: defaultRole,
    });
    authUserRole = signUpRole ? signUpRole.name : authUserRole;
  }
  const { id, username } = profile;
  const query = { $or: [{ username: username }, { uuid: id }] };
  // let user = await findOneItemByQuery(db, userCollectionName, query);
  let { data: user } = await findItemById(db, projectId, userCollection, null, query);

  if (!user) {
    if (type === 'LOGIN') {
      return { status: 404, error: { message: `User doesn't exist. Please Sign up First.` } };
    }

    const newUser = {
      userName: username,
      uuid: id,
      password: generateTemporaryPassword(),
      userRoles: [authUserRole],
    };

    const userResponse = await saveUser(db, projectId, enableAuditTrail, newUser);
    user = userResponse.data;
  }

  let role = '';
  if (user.userRoles && user.userRoles.length > 0) {
    role = await findOneItemByQuery(db, roleCollectionName, {
      name: user.userRoles[0],
    });
  }

  let result = { status: 200, user, role: role ? role.uuid : '', error: null };
  return result;
};

export const encryptUser = async (projectId, collection, userData) => {
  let encryptedUser = null;
  if (!userData && Object.keys(userData).length === 0) {
    return userData;
  }
  const collectionFields = collection ? collection.fields : [];
  // Format userFields before encryption
  userData = formatFieldsOfItem(userData, collectionFields);
  const { enableEncryption, encryption } = await getProjectEncryption(projectId);
  if (!enableEncryption || !encryption) {
    return userData;
  }
  encryptedUser = processItemEncryptDecrypt(userData, collectionFields, encryption, false, []);
  return encryptedUser;
};

export const decryptUser = async (projectId, user, collectionData) => {
  // const collectionData = await userCollectionService(projectId);
  // console.log('🚀 ~ decryptUser ~ collectionData:', collectionData);
  if (collectionData) {
    const { enableEncryption, encryption } = await getProjectEncryption(projectId);
    if (enableEncryption && encryption) {
      const collectionFields = collectionData ? collectionData.fields : [];
      const encryptedRefCollections = await encRefFieldCollections(projectId, collectionFields);
      const cryptResponse = await processItemEncryptDecrypt(
        user,
        collectionFields,
        encryption,
        true,
        encryptedRefCollections,
      );
      user = cryptResponse;
    }
  }
  return user;
};

export const generateAndSendEmailOtpService = async ({
  db,
  projectId,
  enableAuditTrail,
  email,
  emailTemplate,
  otpAuthenticationType,
  password,
  headers,
  environment,
  tenant,
  emailServicePlugin,
}) => {
  try {
    const emailOtpAuthenticatorPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.EMAIL_OTP_AUTHENTICATOR,
    );
    if (!emailOtpAuthenticatorPlugin) return pluginNotInstalledMessage('Login Via Email OTP');
    if (!validateEmail(email)) {
      return { code: 400, message: 'It must be a valid email address.' };
    }
    const query = { $or: [{ email: email }, { userName: email }] };
    const {
      templateResponse,
      user,
      data,
      templateCollection,
      userCollection,
      loginOnSignup,
      code,
      message,
    } = await handleAuthenticatorOTPGeneration(
      db,
      projectId,
      environment,
      enableAuditTrail,
      headers,
      otpAuthenticationType,
      password,
      email,
      null,
      emailOtpAuthenticatorPlugin,
      query,
      emailTemplate,
      'email',
    );
    if (code !== 200) return { code, message };
    const emailSubject = replaceFieldsIntoTemplate(
      templateResponse.subject,
      data,
      user,
      environment,
      templateCollection,
      userCollection,
      {},
      {},
      tenant,
    );
    const emailBody = replaceFieldsIntoTemplate(
      templateResponse.content,
      data,
      user,
      environment,
      templateCollection,
      userCollection,
      {},
      {},
      tenant,
    );
    const { encryption } = await getProjectEncryption(projectId);
    let sendEmailResponse;
    let trackerCollectionName;
    let messages = [];
    if (emailServicePlugin === 'SENDGRID') {
      trackerCollectionName = 'sendgrid_activity_tracker';
      const sendGridPlugin = await findInstalledPlugin(projectId, pluginCode.SENDGRID);
      if (!sendGridPlugin) return pluginNotInstalledMessage('SendGrid');
      const { apiKey, from_email, from_name, reply_to } = sendGridPlugin.setting;
      sendEmailResponse = await sendEmailUsingSendGrid(
        replaceValueFromSource(apiKey, environment, tenant),
        email,
        emailSubject,
        emailBody,
        replaceValueFromSource(from_email, environment, tenant),
        replaceValueFromSource(from_name, environment, tenant),
        replaceValueFromSource(reply_to, environment, tenant),
        null,
        null,
        data[templateResponse.attachmentField] || [],
        projectId,
        environment,
        encryption,
      );
    } else if (emailServicePlugin === 'RESEND') {
      trackerCollectionName = 'resend_activity_tracker';
      const resendPlugin = await findInstalledPlugin(projectId, pluginCode.RESEND);
      if (!resendPlugin) return pluginNotInstalledMessage('Resend');
      const { apiKey, from_email, from_name } = resendPlugin.setting;
      sendEmailResponse = await sendEmailUsingResend(
        projectId,
        environment,
        encryption,
        replaceValueFromSource(apiKey, environment, tenant),
        replaceValueFromSource(from_name, environment, tenant),
        replaceValueFromSource(from_email, environment, tenant),
        email,
        emailSubject,
        emailBody,
        data[templateResponse.attachmentField] || [],
        null,
        null,
      );
    } else {
      trackerCollectionName = 'aws_ses_activity_tracker';
      const { config, fromEmailAndName, replyTo } = await loadSESPluginConfig(
        projectId,
        environment,
        tenant,
      );
      sendEmailResponse = await sendEmailUsingSes(
        config,
        email,
        emailSubject,
        emailBody,
        fromEmailAndName,
        replyTo,
        null,
        null,
        data[templateResponse.attachmentField] || [],
        projectId,
        environment,
        encryption,
      );
    }
    sendEmailResponse.emailOtpToken = data.emailOtpToken;
    messages.push({
      templateId: emailTemplate,
      sender: user,
      itemId: user?.uuid || '',
      sendTo: email,
      ccTo: null,
      bccTo: null,
      emailSubject,
      emailBody,
      status: sendEmailResponse?.status,
      emailServicePlugin,
      error: sendEmailResponse?.error,
    });
    await handleEmailActivityTrackers(
      db,
      projectId,
      enableAuditTrail,
      headers,
      messages,
      user,
      emailSubject,
      emailBody,
      trackerCollectionName,
      environment,
    );
    if (user.uuid) sendEmailResponse['userId'] = user.uuid;
    if (loginOnSignup && otpAuthenticationType === 'signUp')
      sendEmailResponse['message'] = 'User already exists.';
    return sendEmailResponse;
  } catch (error) {
    console.error('Error in generateAndSendEmailOtpService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const verifyEmailOtpAndLoginService = async ({
  db,
  projectId,
  enableAuditTrail,
  otp,
  emailOtpToken,
  headers,
  environment,
  includeUserObj = true,
}) => {
  try {
    const emailOtpAuthenticatorPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.EMAIL_OTP_AUTHENTICATOR,
    );
    if (!emailOtpAuthenticatorPlugin) return pluginNotInstalledMessage('Login Via Email OTP');
    const userCollection = await userCollectionService(projectId);
    if (!userCollection) return collectionNotFoundMessage('User');
    const emailOtpCollection = await findOneCollectionService(projectId, 'email_otps');
    if (!emailOtpCollection) return collectionNotFoundMessage('Email OTPs');
    const { data } = await findItemById(db, projectId, emailOtpCollection, null, { emailOtpToken });
    if (!data) return { code: 400, message: 'OTP item not found with the token.' };
    const { emailOtp, emailOtpExpiry, userId, uuid } = data;
    let { data: user } = await findItemById(db, projectId, userCollection, userId[0]?.uuid);
    if (!user) return { code: 404, message: 'User not found' };
    if (!emailOtp || emailOtp !== otp || Date.now() > emailOtpExpiry) {
      return { code: 400, message: 'Invalid or expired OTP.' };
    }
    await removeItemById(
      db,
      projectId,
      environment,
      enableAuditTrail,
      'email_otps',
      uuid,
      user,
      headers,
    );
    let role = '';
    if (user.userRoles && user.userRoles.length > 0) {
      role = await findOneItemByQuery(db, roleCollectionName, {
        name: user.userRoles[0],
      });
    }
    user = { ...user, role: role.uuid };
    if (user) {
      let userDetails = null;
      let role = user.role;
      userDetails = user;
      delete userDetails._id;
      delete userDetails.updatedAt;
      delete userDetails.password;
      userDetails = await decryptUser(projectId, userDetails, userCollection);
      let finalData = {
        projectId,
        userId: userDetails.uuid,
      };
      if (!includeUserObj)
        return { code: 200, data: finalData, message: 'OTP Verified Successfully' };
      const tenant = userDetails.tenantId?.[0] || '';
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
        tenant?.uuid || '',
      );
      const subTenant = await getSubTenantById(db, projectId, subTenantId);
      if (tenant) {
        await handleMultiTenantLoginProcess(db, userDetails, role, tenant, subTenant, userSetting);
      }
      const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
      const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);
      console.log('verifyEmailOtpAndLoginService');
      finalData = {
        ...finalData,
        auth: true,
        token: tokenObject.token,
        expiresIn: tokenObject.expires,
        userDetails,
        role,
        tenant,
        userSetting,
        subTenant,
      };
      return { code: 200, data: finalData, message: 'OTP Verified Successfully' };
    } else {
      return { code: 500, message: 'Error in Clearing OTP from user.' };
    }
  } catch (error) {
    console.error('Error in verifyEmailOtpAndLoginService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const verifySmsOtpAndLoginService = async ({
  db,
  projectId,
  enableAuditTrail,
  otp,
  smsOtpToken,
  headers,
  environment,
  includeUserObj = true,
}) => {
  try {
    const smsOtpAuthenticatorPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.SMS_OTP_AUTHENTICATOR,
    );
    if (!smsOtpAuthenticatorPlugin) return pluginNotInstalledMessage('Login Via SMS OTP');
    const userCollection = await userCollectionService(projectId);
    if (!userCollection) return collectionNotFoundMessage('User');
    const smsOtpCollection = await findOneCollectionService(projectId, 'sms_otps');
    if (!smsOtpCollection) return collectionNotFoundMessage('SMS OTPs');
    const { data } = await findItemById(db, projectId, smsOtpCollection, null, { smsOtpToken });
    if (!data) return { code: 400, message: 'OTP item not found with the token.' };
    const { smsOtp, smsOtpExpiry, userId, uuid } = data;
    let { data: user } = await findItemById(db, projectId, userCollection, userId[0]?.uuid);
    if (!user) return { code: 404, message: 'User not found' };
    if (!smsOtp || smsOtp !== otp || Date.now() > smsOtpExpiry) {
      return { code: 400, message: 'Invalid or expired OTP.' };
    }
    await removeItemById(
      db,
      projectId,
      environment,
      enableAuditTrail,
      'sms_otps',
      uuid,
      user,
      headers,
    );
    let role = '';
    if (user.userRoles && user.userRoles.length > 0) {
      role = await findOneItemByQuery(db, roleCollectionName, {
        name: user.userRoles[0],
      });
    }
    user = { ...user, role: role.uuid };
    if (user) {
      let userDetails = null;
      let role = user.role;
      userDetails = user;
      delete userDetails._id;
      delete userDetails.updatedAt;
      delete userDetails.password;
      userDetails = await decryptUser(projectId, userDetails, userCollection);
      let finalData = {
        projectId,
        userId: userDetails.uuid,
      };
      if (!includeUserObj)
        return { code: 200, data: finalData, message: 'OTP Verified Successfully' };
      const tenant = userDetails.tenantId?.[0] || '';
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
        tenant?.uuid || '',
      );
      const subTenant = await getSubTenantById(db, projectId, subTenantId);
      if (tenant) {
        await handleMultiTenantLoginProcess(db, userDetails, role, tenant, subTenant, userSetting);
      }
      const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
      const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);
      finalData = {
        ...finalData,
        auth: true,
        token: tokenObject.token,
        expiresIn: tokenObject.expires,
        userDetails,
        role,
        tenant,
        userSetting,
        subTenant,
      };
      return { code: 200, data: finalData, message: 'OTP Verified Successfully' };
    } else {
      return { code: 500, message: 'Error in Clearing OTP from user.' };
    }
  } catch (error) {
    console.error('Error in verifySmsOtpAndLoginService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const handleAuthenticatorOTPGeneration = async (
  db,
  projectId,
  environment,
  enableAuditTrail,
  headers,
  otpAuthenticationType,
  password,
  email,
  phone_number,
  otpAuthenticatorPlugin,
  query,
  template,
  otpMethod,
) => {
  try {
    const userCollection = await userCollectionService(projectId);
    if (!userCollection) return collectionNotFoundMessage('User');
    let { data: user } = await findItemById(db, projectId, userCollection, null, query);
    let authType = otpAuthenticationType;
    let authUserRole;
    const { defaultRole, otpLength, otpExpiryTime, loginOnSignup } = otpAuthenticatorPlugin.setting;
    console.log('{ defaultRole, otpLength, otpExpiryTime, loginOnSignup } :>> ', {
      defaultRole,
      otpLength,
      otpExpiryTime,
      loginOnSignup,
    });

    if (authType === 'login' && password && user?.password) {
      const validPassword = await compareBcryptPassword(password, user.password);
      if (!validPassword) return { code: 401, message: 'Invalid Password.' };
    }
    if (authType === 'signUp') {
      if (user) {
        if (!loginOnSignup) {
          return {
            code: 400,
            message: 'User already exists. Please select Login authentication type.',
          };
        } else {
          authType = 'login';
        }
      }
      if (!defaultRole) return { code: 400, message: 'Sign Up Role not provided in Plugin.' };
      let signUpRole = await findOneItemByQuery(db, roleCollectionName, {
        uuid: defaultRole,
      });
      if (!signUpRole) return { code: 400, message: 'Sign Up Role not found.' };
      authUserRole = signUpRole.name;
    }
    if (!user) {
      if (authType === 'login') {
        return { code: 404, message: { message: `User doesn't exist. Please Sign up First.` } };
      }
      let newUser;
      let isNewPhoneSignUp = false;
      if (otpMethod === 'email') {
        newUser = {
          email: email.trim(),
          uuid: uuidv4(),
          password: password || chance.string({ length: 10 }),
          userRoles: [authUserRole],
        };
      } else {
        newUser = {
          phone_number: phone_number.trim(),
          uuid: uuidv4(),
          password: password || chance.string({ length: 10 }),
          userRoles: [authUserRole],
        };
        isNewPhoneSignUp = true;
      }
      const userResponse = await saveUser(
        db,
        projectId,
        enableAuditTrail,
        newUser,
        isNewPhoneSignUp,
      );
      user = userResponse.data;
    }
    const otp = chance.string({ length: otpLength, pool: '0123456789' });
    const otpExpiry = Date.now() + otpExpiryTime * 1000;
    const otpToken = uuidv4();
    let itemData;
    if (otpMethod === 'email') {
      itemData = {
        emailOtp: otp,
        emailOtpExpiry: otpExpiry,
        emailOtpToken: otpToken,
        userId: user?.uuid,
      };
    } else {
      itemData = {
        smsOtp: otp,
        smsOtpExpiry: otpExpiry,
        smsOtpToken: otpToken,
        userId: user?.uuid,
      };
    }
    const otpCollection = await findOneCollectionService(projectId, `${otpMethod}_otps`);
    if (!otpCollection) return collectionNotFoundMessage(`${voca.titleCase(otpMethod)} OTPs`);
    const { data: existingOTP } = await findItemById(db, projectId, otpCollection, null, {
      userId: { $in: [user.uuid] },
    });
    let result;
    if (existingOTP) {
      result = await updateCollectionItem(
        db,
        projectId,
        environment,
        enableAuditTrail,
        otpCollection,
        existingOTP.uuid,
        itemData,
        user,
        headers,
      );
    } else {
      result = await saveCollectionItem(
        db,
        projectId,
        enableAuditTrail,
        otpCollection,
        itemData,
        user,
        headers,
        environment,
      );
    }
    if (![200, 201].includes(result.code)) {
      return { code: 500, message: 'Failed to update user with OTP.' };
    }
    let templateCollection;
    let templateResponse;
    if (template) {
      templateResponse = await findTemplate(projectId, template);
      if (!templateResponse) {
        return { code: 404, message: `Template with ID ${template} not found.` };
      }
      if (templateResponse.collectionId !== otpCollection.collectionName) {
        return {
          code: 400,
          message: `Template Collection should be ${voca.titleCase(
            otpMethod,
          )} OTPs Collection only.`,
        };
      }
      templateCollection = otpCollection;
    }
    let { data } = await findItemById(db, projectId, otpCollection, result.data.uuid);
    data = await cryptService(data, projectId, otpCollection, true, false, true);
    return {
      code: 200,
      message: 'OTP Generated Successfully',
      templateResponse,
      user,
      data,
      templateCollection,
      userCollection,
      loginOnSignup,
      otpToken,
    };
  } catch (error) {
    console.error('Error in handleAuthenticatorOTPGeneration', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const checkAndUpdateUserPasswordResetAttempts = async (db, user) => {
  const resetTimeLimit = 15 * 60 * 1000;
  const now = Date.now();

  let errorMsg = null;

  let passwordResetAttempts = user?.passwordResetAttempts || 0;
  let lastResetReqAt = user?.lastResetReqAt || 0;

  if (!lastResetReqAt || now - lastResetReqAt > resetTimeLimit) {
    passwordResetAttempts = 1;
    lastResetReqAt = now;
  } else {
    if (passwordResetAttempts < 3) {
      passwordResetAttempts = passwordResetAttempts + 1;
    } else {
      return {
        newUser: null,
        errorMsg:
          'Too many password reset attempts for this account, please try again after 15 minutes.',
      };
    }
  }

  let dbCollection = await db.collection(userCollectionName);
  let newValues = { $set: { passwordResetAttempts, lastResetReqAt } };
  await dbCollection.updateOne({ uuid: user.uuid }, newValues);
  user.passwordResetAttempts = passwordResetAttempts;
  user.lastResetReqAt = lastResetReqAt;
  return { newUser: user, errorMsg };
};

export const checkUserLoginAttempts = (user) => {
  let error = null;
  const now = Date.now();

  // Reset loginAttempts if enough time has passed since the last attempt
  if (user.lastLoginAttemptAt && now - user.lastLoginAttemptAt > COOLDOWN_PERIOD) {
    user.loginAttempts = 0; // Reset attempts
  }
  // Check if the user is temporarily locked out
  if (user.loginAttempts && user.loginAttempts >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = now - user.lastLoginAttemptAt;
    const timeLeft = COOLDOWN_PERIOD - timeSinceLastAttempt;

    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 1000 / 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);
      error = `Account locked. Try again in ${minutes} minute(s) and ${seconds} second(s).`;
    } else {
      // Unlock the user after cooldown
      user.loginAttempts = 0;
    }
  }
  return { user, error };
};

export const updateUserLoginAttemptDetails = async (dbConnection, user, isValidPassword) => {
  const now = Date.now();
  let loginAttempts = user?.loginAttempts || 0;
  let lastLoginAttemptAt = user?.lastLoginAttemptAt || 0;

  if (isValidPassword) {
    loginAttempts = 0;
    lastLoginAttemptAt = 0;
  } else {
    loginAttempts += 1;
    lastLoginAttemptAt = now;
  }

  let dbCollection = await dbConnection.collection(userCollectionName);
  let newValues = { $set: { loginAttempts, lastLoginAttemptAt } };
  await dbCollection.updateOne({ uuid: user.uuid }, newValues);
  user.loginAttempts = loginAttempts;
  user.lastLoginAttemptAt = lastLoginAttemptAt;
  return user;
};

export const loginWithTwoFactor = async (db, projectId, environment, uuid) => {
  const userCollection = await userCollectionService(projectId);
  if (!userCollection) {
    return null;
  }
  const query = { uuid: uuid };
  const { permissionLevelSecurity } = userCollection || {};
  let { data: user } = await findItemById(db, projectId, userCollection, null, query);
  if (!user) {
    return null;
  }
  let role = '';

  if (user.userRoles && user.userRoles.length > 0) {
    role = await findOneItemByQuery(db, roleCollectionName, {
      name: user.userRoles[0],
    });
  }
  if (!role || role.length === 0) {
    //Handle role is not valid
  }
  user = { ...user, role: role.uuid };

  try {
    let finalData = {};
    let userDetails = null;
    let role = user.role;

    userDetails = user;
    userDetails = cleanUserItem(userDetails);
    userDetails = await decryptUser(projectId, userDetails, userCollection);
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

    finalData = {
      auth: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      userDetails,
      role,
      tenant,
      userSetting,
      subTenant,
      projectId: projectId,
    };
    return finalData;
  } catch (error) {
    console.error('error', error);
    return null;
  }
};

export const cleanUserItem = (user) => {
  const keys = Object.keys(user);
  // Delete mongo fields
  if (user._id || keys.includes('_id')) delete user._id;
  if (user.updatedAt || keys.includes('updatedAt')) delete user.updatedAt;
  if (user.password || keys.includes('password')) delete user.password;
  // Delete Login related fields
  if (user.loginAttempts || keys.includes('loginAttempts')) delete user.loginAttempts;
  if (user.lastLoginAttemptAt || keys.includes('lastLoginAttemptAt'))
    delete user.lastLoginAttemptAt;
  // Delete password reset related fields
  if (user.passwordResetAttempts || keys.includes('passwordResetAttempts'))
    delete user.passwordResetAttempts;
  if (user.lastResetReqAt || keys.includes('lastResetReqAt')) delete user.lastResetReqAt;
  return user;
};

// Custom password validation middleware
export const validatePasswordMiddleware = (req, res, next) => {
  const password = extractPasswordFromReq(req);
  if (password) {
    // Password validation rules
    const errors = [];
    if (password.length < 8) {
      errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('at least one digit');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('at least one special character');
    }

    if (errors.length > 0) {
      // Return errors if password validation fails
      const errorStr = `Password must contain ${errors.join(', ')}.`;
      return res.status(400).send(errorStr);
    }
  }

  next();
};

const extractPasswordFromReq = (req) => {
  let password = '';
  // Check for user-tenants field event
  if (req.route.path === '/create-user-with-multi-tenant-fields') {
    const { userData } = req.body;
    password = userData?.password;
  } else password = req.body?.password;

  return password;
};

export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { code: 400, message: 'invalid password', error: 'invalid password' };
  }

  if (password.length < 8) {
    errors.push('at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('at least one digit');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('at least one special character');
  }

  if (errors.length > 0) {
    const errorStr = `Password must contain ${errors.join(', ')}.`;
    return { code: 400, message: errorStr, error: errorStr, valid: false };
  }
  return { code: 200, message: 'Valid', valid: true };
};

export const generateTemporaryPassword = () => {
  const lowercase = chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz', length: 1 });
  const uppercase = chance.string({ pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', length: 1 });
  const digit = chance.string({ pool: '0123456789', length: 1 });
  const specialChar = chance.string({ pool: '!@#$', length: 1 });
  const remaining = chance.string({
    pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$',
    length: 6,
  });
  return lowercase + uppercase + digit + specialChar + remaining;
};

export const generateEmailOtpService = async ({
  db,
  projectId,
  enableAuditTrail,
  email,
  otpAuthenticationType,
  password,
  headers,
  environment,
}) => {
  try {
    const emailOtpAuthenticatorPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.EMAIL_OTP_AUTHENTICATOR,
    );
    if (!emailOtpAuthenticatorPlugin) return pluginNotInstalledMessage('Login Via Email OTP');
    if (!validateEmail(email)) {
      return { code: 400, message: 'It must be a valid email address.' };
    }
    const query = { $or: [{ email: email }, { userName: email }] };
    const { code, message, otpToken } = await handleAuthenticatorOTPGeneration(
      db,
      projectId,
      environment,
      enableAuditTrail,
      headers,
      otpAuthenticationType,
      password,
      email,
      null,
      emailOtpAuthenticatorPlugin,
      query,
      null,
      'email',
    );
    return { code, message, emailOtpToken: otpToken };
  } catch (error) {
    console.error('Error in generateEmailOtpService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const generateSmsOtpService = async ({
  db,
  projectId,
  enableAuditTrail,
  phone_number,
  otpAuthenticationType,
  password,
  headers,
  environment,
}) => {
  try {
    const smsOtpAuthenticatorPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.SMS_OTP_AUTHENTICATOR,
    );
    if (!smsOtpAuthenticatorPlugin) return pluginNotInstalledMessage('Login Via SMS OTP');
    if (!validatePhoneNumber(phone_number)) {
      return { code: 400, message: 'It must be a valid phone number.' };
    }
    // Phone Number Regex
    const cleanedInput = phone_number.replace(/\D/g, '');
    const flexibleRegexString = cleanedInput.split('').join('[\\s\\-\\.\\(\\)]*');
    const phoneRegex = new RegExp(flexibleRegexString, 'i');
    const query = { phone_number: { $regex: phoneRegex } };
    const { code, message, otpToken } = await handleAuthenticatorOTPGeneration(
      db,
      projectId,
      environment,
      enableAuditTrail,
      headers,
      otpAuthenticationType,
      password,
      null,
      phone_number,
      smsOtpAuthenticatorPlugin,
      query,
      null,
      'sms',
    );
    return { code, message, smsOtpToken: otpToken };
  } catch (error) {
    console.error('Error in generateAndSendEmailOtpService:', error);
    return { code: 500, message: 'Internal Server Error', error: error?.message || error };
  }
};

export const saveUserWithMultiTenantFields = async (
  dbConnection,
  projectId,
  enableAuditTrail,
  environment,
  userData,
  eventConfig,
) => {
  const collectionData = await checkCollectionByName(projectId, userCollectionName);
  if (!collectionData) {
    return { code: 404, data: `Collection not found with provided name` };
  }

  validateUserData(collectionData, userData);
  userData.password = userData.password ? userData.password : generateTemporaryPassword();
  console.log('==> saveUserWithMultiTenantFields userData :>> ', userData);
  const errorJson = await validateItemCollection(
    dbConnection,
    collectionData,
    userData,
    null,
    false,
  );
  if (Object.keys(errorJson).length !== 0 && errorJson.field) {
    return {
      code: 409,
      message: 'Validation Failed',
      data: errorJson.field,
    };
  }

  let role = '';
  if (userData.userRoles && userData.userRoles.length > 0) {
    let roleName = isArray(userData.userRoles) ? userData.userRoles[0] : userData.userRoles;
    role = await findOneItemByQuery(dbConnection, roleCollectionName, {
      name: roleName,
    });
  }

  if (!role || role.length === 0) {
    return {
      code: 409,
      message: 'Validation Failed',
      data: 'The provided role does not exist. Please verify and try again.',
    };
  }
  delete userData.tenantRoleMapping;

  let uuid = uuidv4();

  userData = await convertAutoGenerateTypeFields(dbConnection, projectId, collectionData, userData);

  //Encrypt Record here
  userData = await encryptUser(projectId, collectionData, userData);

  userData = await convertPasswordTypeFields(dbConnection, projectId, collectionData, userData);
  userData = await convertSingleItemToList(collectionData, userData);
  userData = await convertStringDataToObject(collectionData, userData);
  userData.createdAt = new Date();
  userData.updatedAt = new Date();
  userData.uuid = uuid;

  let dbCollection = await dbConnection.collection(userCollectionName);
  // FINAL: START:Audit Trail
  createAuditTrail(
    dbConnection,
    enableAuditTrail,
    'NORMAL',
    'create',
    '',
    userCollectionName,
    userData,
  );
  // END:Audit Trail

  const { tenantId, subTenantId, userSettingId, error } = await createMultiTenantFieldItems(
    projectId,
    dbConnection,
    enableAuditTrail,
    environment,
    eventConfig,
    userData,
  );
  if (error)
    return {
      code: 400,
      message: error.message,
      data: {},
    };
  if (tenantId.length) userData['tenantId'] = tenantId;
  if (subTenantId.length) userData['subTenantId'] = subTenantId;
  if (userSettingId.length) userData['userSettingId'] = userSettingId;

  const savedItem = await customInsertOne(dbCollection, userData);
  // eslint-disable-next-line no-prototype-builtins
  if (savedItem) {
    await copyPermissionsInUser(dbConnection, enableAuditTrail, savedItem);
  }

  return {
    code: 201,
    message: 'Item Created Successfully',
    data: savedItem ? savedItem : {},
  };
};

const createMultiTenantFieldItems = async (
  projectId,
  dbConnection,
  enableAuditTrail,
  environment,
  eventConfig,
  userData,
) => {
  const result = {
    tenantId: [],
    subTenantId: [],
    userSettingId: [],
    error: '',
  };

  try {
    const { createTenant, createSubTenant, createUserSetting } = eventConfig;
    const collectionMap = [
      { flag: createTenant, service: multiTenantCollService, key: 'tenantId' },
      { flag: createSubTenant, service: subTenantCollService, key: 'subTenantId' },
      { flag: createUserSetting, service: userSettingCollService, key: 'userSettingId' },
    ];

    // Creating Empty Multi Tenant Items
    const creationResults = await Promise.all(
      collectionMap
        .filter(({ flag }) => flag)
        .map(async ({ service, key }) => {
          const collection = await service(projectId);
          const item = generateEmptyItemsForCollection(collection);

          const response = await saveCollectionItem(
            dbConnection,
            projectId,
            enableAuditTrail,
            collection,
            item,
            {},
            [],
            environment,
          );

          if (response.code === 201) {
            const uuid = response.data.uuid; // Extract only UUID
            result[key].push(uuid);
            return { key, uuid, collection };
          }

          return null;
        }),
    );

    const tenantId = result.tenantId[0];
    const subTenantId = result.subTenantId[0];
    const userSettingId = result.userSettingId[0];

    // Updating Multi Tenant Items Reference with each others
    const updatePromises = [];

    const tenantCreation = creationResults.find((r) => r?.key === 'tenantId');
    const subTenantCreation = creationResults.find((r) => r?.key === 'subTenantId');
    const userSettingCreation = creationResults.find((r) => r?.key === 'userSettingId');
    // Update Tenant
    if (tenantId && subTenantId && tenantCreation) {
      const dbCollection = await dbConnection.collection(tenantCreation.collection.collectionName);
      updatePromises.push(
        dbCollection.findOneAndUpdate(
          { uuid: tenantId },
          { $set: { subTenantId: [subTenantId] } },
          { returnDocument: 'after' },
        ),
      );
    }
    // Update SubTenant
    if (subTenantId && tenantId && subTenantCreation) {
      const dbCollection = await dbConnection.collection(
        subTenantCreation.collection.collectionName,
      );
      updatePromises.push(
        dbCollection.findOneAndUpdate(
          { uuid: subTenantId },
          { $set: { tenantId: [tenantId] } },
          { returnDocument: 'after' },
        ),
      );
    }
    // Update UserSetting
    if (userSettingId && userSettingCreation) {
      const updatePayload = {
        ...(tenantId && { tenantId: [tenantId] }),
        ...(subTenantId && { subTenantId: [subTenantId] }),
        ...(userData?.uuid && { userId: [userData.uuid] }),
      };
      const dbCollection = await dbConnection.collection(
        userSettingCreation.collection.collectionName,
      );
      updatePromises.push(
        dbCollection.findOneAndUpdate(
          { uuid: userSettingId },
          { $set: updatePayload },
          { returnDocument: 'after' },
        ),
      );
    }

    await Promise.all(updatePromises);
  } catch (error) {
    console.log('\n error', error);
    result.error = error;
  }
  return result;
};

const generateEmptyItemsForCollection = (collection) => {
  const DefaultSystemCreatedFields = [
    'uuid',
    'createdBy',
    'isDeleted',
    'updatedAt',
    'createdAt',
    'tenantId',
    'subTenantId',
    'userSettingId',
  ];
  const arrayFields = ['reference', 'static_option', 'dynamic_option', 'belongsTo'];
  const itemData = {};
  const { fields } = collection;
  fields.forEach((field) => {
    if (!DefaultSystemCreatedFields.includes(field.fieldName)) {
      let value = '';
      if (arrayFields.includes(field.type)) {
        value = [];
      }
      itemData[field.fieldName] = value;
    }
  });
  return itemData;
};
