import { pluginCode } from 'drapcode-constant';
import {
  compareBcryptPassword,
  convertHashPassword,
  roleCollectionName,
  userCollectionName,
  processUserWithPLS,
} from './loginUtils';
import { createAuditTrail } from '../logs/audit/audit.service';
import { isNew } from '../utils/appUtils';
import {
  extractFirstSubTenantIdFromUserAndTenantId,
  extractFirstTenantIdFromUser,
  extractUserSettingFromUserAndTenant,
  getSubTenantById,
  getTenantById,
} from '../tenant/tenant.service';
import {
  checkUserLoginAttempts,
  updateUserLoginAttemptDetails,
  generateTemporaryPassword,
  decryptUser,
  cleanUserItem,
} from '../loginPlugin/user.service';
import { findItemById, findOneItemByQuery } from '../item/item.service';
import { userCollectionService } from '../collection/collection.service';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
const buildUserQuery = (body, userName) => {
  let emailFieldValue = userName;
  if (body['email']) {
    emailFieldValue = body['email'];
  }
  let phoneNumberValue = userName;
  if (body['phone_number']) {
    phoneNumberValue = body['phone_number'];
    userName = '';
    emailFieldValue = '';
  }
  let query = {};
  const emailQuery = { email: { $regex: `^${emailFieldValue}$`, $options: 'i' } };
  const usernameQuery = { userName: { $regex: `^${userName}$`, $options: 'i' } };
  const phoneNumberQuery = { phone_number: phoneNumberValue };
  if (body['email']) {
    if (body['queryType'] && body['queryType'] === 'OR') {
      query = { $or: [emailQuery, usernameQuery] };
    } else {
      query = { $and: [emailQuery, usernameQuery] };
    }
  } else if (body['phone_number']) {
    if (body['queryType'] && body['queryType'] === 'OR') {
      query = { $or: [usernameQuery, phoneNumberQuery] };
    } else {
      query = { $and: [usernameQuery, phoneNumberQuery] };
    }
  } else {
    query = { $or: [emailQuery, usernameQuery, phoneNumberQuery] };
  }
  return query;
};

export const authenticateUser = async (req, userName, password, done) => {
  //Make API call
  const { db, projectId, query: reqQuery, body, enableAuditTrail } = req;
  let { authType } = reqQuery;

  try {
    const query = buildUserQuery(body, userName);
    const userCollection = await userCollectionService(projectId);
    if (!userCollection) {
      return done({ error: 'User collection not found', status: 404 }, null, null);
    }

    let { data: user } = await findItemById(db, projectId, userCollection, null, query);
    if (!user) return done({ error: 'This user does not exists.', status: 404 }, null, null);

    // Lockout logic
    const lockCheck = checkUserLoginAttempts(user);
    if (lockCheck.error) return done({ error: lockCheck.error, status: 403 }, null, null);
    user = lockCheck.user;

    // Plugin enforcement
    const loginPlugin = await findInstalledPlugin(projectId, pluginCode.LOGIN);
    if (authType !== 'anonymous' && loginPlugin?.setting) {
      const { is_email_verified, is_enabled } = loginPlugin.setting;
      if (is_email_verified && !user.is_email_verified)
        return done({ error: 'Please verify email first.', status: 401 }, null, null);
      if (is_enabled && !user.is_enabled)
        return done({ error: 'Account is not active.', status: 401 }, null, null);
    }

    // Password check
    const validPassword = await compareBcryptPassword(password, user.password);
    user = await updateUserLoginAttemptDetails(db, user, validPassword);
    if (!validPassword)
      return done({
        error: 'Username or password does not match. Please try again.',
        status: 401,
      });

    if (authType && authType === 'anonymous') {
      user.password = await convertHashPassword(generateTemporaryPassword());
      if (user._id) {
        delete user._id;
      }
      const newValues = { $set: { password: user.password } };
      const result = await db.collection(userCollectionName);
      // FINAL: START:Audit Trail
      createAuditTrail(
        db,
        enableAuditTrail,
        'SYSTEM',
        'update',
        '',
        userCollectionName,
        '',
        '',
        false,
        '',
        'Password is changed',
      );
      // END:Audit Trail
      await result.findOneAndUpdate(query, newValues, isNew);
    }

    const twoFactorPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.TWO_FACTOR_AUTHENTICATION,
    );

    let redirectTo = '';
    if (twoFactorPlugin) {
      if (user.is_secret_code_verify) redirectTo = 'VERIFY';
      else if (twoFactorPlugin.setting.forceEnable) redirectTo = 'REGISTER';
    }

    let roleRecord = null;
    if (user.userRoles?.length > 0) {
      roleRecord = await findOneItemByQuery(db, roleCollectionName, {
        name: user.userRoles[0],
      });
    }

    if (!roleRecord)
      return done(null, false, {
        message: 'The provided role does not exist. Please verify and try again.',
        status: 401,
      });

    let userDetails = cleanUserItem(user);
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

    if (tenant) delete tenant._id;
    if (userSetting) delete userSetting._id;
    if (subTenant) delete subTenant._id;

    console.log('userSetting?.userRoles :>> ', userSetting?.userRoles);

    const finalRole = roleRecord.uuid;
    userDetails.role = finalRole;
    userDetails.userRoles = userSetting?.userRoles || [roleRecord.name];
    console.log('redirectTo :>> ', redirectTo);
    console.log('userDetails :>> ', userDetails);

    if (redirectTo === 'VERIFY') {
      userDetails.userRoles = ['TWO_FACTOR_VERIFY', ...userDetails.userRoles];
      if (userSetting?.userRoles?.length)
        userSetting.userRoles = ['TWO_FACTOR_VERIFY', ...userSetting.userRoles];
    }

    const { permissionLevelSecurity } = userCollection;
    userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);
    const output = {
      userDetails,
      role: finalRole,
      tenant,
      subTenant,
      userSetting,
      redirectTo,
      provider: req.params.provider,
      token: user.token, // For XANO
    };
    console.log('output :>> ', output);
    return done(null, output);
  } catch (error) {
    console.error('authenticateUser error:', error);
    return done({ error: 'Internal Authentication Error', status: 500 });
  }
};
