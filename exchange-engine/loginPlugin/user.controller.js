import passport from 'passport';
import {
  convertHashPassword,
  compareBcryptPassword,
  userCollectionName,
  roleCollectionName,
  handleMultiTenantLoginProcess,
  processUserWithPLS,
} from '../security/loginUtils';
import { findItemById, findOneItemByQuery } from '../item/item.service';
import { issueJWTToken, getTokenExpireTime, logoutAllUserToken } from '../security/jwtUtils';
import {
  checkAndUpdateUserPasswordResetAttempts,
  cleanUserItem,
  decryptUser,
  generateAndSendEmailOtpService,
  generateAndSendSmsOtpService,
  saveAnonymousUser,
  saveUserWithProvider,
  updateTenantPermissionsService,
  updateUserPermissionsService,
  updateUserSettingsPermissionsService,
  generateEmailOtpService,
  generateSmsOtpService,
  saveUserWithMultiTenantFields,
} from './user.service';
import { userCollectionService } from '../collection/collection.service';
import { isNew } from '../utils/appUtils';
import { getSendToUser, sendEmailTemplateService } from '../email/email.service';
import {
  extractFirstSubTenantIdFromUserAndTenantId,
  extractFirstTenantIdFromUser,
  extractUserSettingFromUserAndTenant,
  getSubTenantById,
  getTenantById,
  getUserSettingById,
} from '../tenant/tenant.service';
import { PROVIDER_TYPE } from '../security/socialAuth';

export const addUserWithProvider = async (req, res, next) => {
  try {
    const { db, body, projectId, params, environment, enableAuditTrail } = req;
    const { provider } = params;
    const response = await saveUserWithProvider(
      db,
      projectId,
      enableAuditTrail,
      body,
      provider,
      environment,
    );
    return res.status(response.code).send(response.data);
  } catch (err) {
    next(err);
  }
};

export const forceLogoutAllDevices = async (req, res, next) => {
  const {
    db,
    params: { userId },
    user: adminUser,
  } = req;
  if (!userId) res.status(400).send({ message: 'User Id is not provided.' });
  const userData = await findOneItemByQuery(db, userCollectionName, { uuid: userId });
  if (!userData) res.status(404).send({ message: 'User not Found.' });

  let isUserAllowed = userId === userData.uuid || adminUser?.isSuperAdmin;
  if (!isUserAllowed) {
    const adminUserTenantUuids = adminUser.tenantId.map((t) => t.uuid);
    isUserAllowed = adminUserTenantUuids.some((uuid) => userData.tenantId.includes(uuid));
  }
  if (isUserAllowed) {
    const userSub = userData.username || userData.userName || userData.email;
    if (!userSub) res.status(404).send({ message: 'User not Found.' });
    try {
      const { code, data } = await logoutAllUserToken(userSub);
      res.status(code).send(data);
    } catch (error) {
      console.log('\n ===error', error);
      next(error);
    }
  } else
    res
      .status(401)
      .send({ message: 'You are not authorized to perform logout on this user account.' });
};

export const addAnonymousUser = async (req, res, next) => {
  try {
    const { db, body, projectId, enableAuditTrail } = req;
    const response = await saveAnonymousUser(db, projectId, enableAuditTrail, body);
    return res.status(response.code).send(response.data);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  const { db, body } = req;
  try {
    let query = {
      uuid: req.user.uuid,
    };
    const user = await findOneItemByQuery(db, userCollectionName, query);
    if (!user) {
      return res.status(401).json({ message: 'Password reset link is invalid or has expired.' });
    }
    user.password = await convertHashPassword(body.password);
    query = { uuid: user.uuid };

    if (user._id) {
      delete user._id;
    }

    const newValues = { $set: user };
    let dbCollection = await db.collection(userCollectionName);

    await dbCollection.findOneAndUpdate(query, newValues, isNew);
    return res.status(200).send('Password updated successfully');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  const { db, body } = req;
  try {
    let query = {
      uuid: req.user.uuid,
    };
    const user = await findOneItemByQuery(db, userCollectionName, query);
    if (!user) {
      return res.status(401).json({ message: 'User not found!' });
    }
    const isPassowrdMatched = await compareBcryptPassword(body.oldPassword, user.password);
    if (!isPassowrdMatched) {
      return res.status(401).json({ message: 'Old Password does not match!' });
    }
    user.password = await convertHashPassword(body.password);
    query = { uuid: user.uuid };

    if (user._id) {
      delete user._id;
    }

    const newValues = { $set: user };
    let dbCollection = await db.collection(userCollectionName);
    await dbCollection.findOneAndUpdate(query, newValues, isNew);
    return res.status(200).send('Password updated successfully!');
  } catch (err) {
    next(err);
  }
};

export const loginWithProvider = async (req, res, next) => {
  const { params, projectId, db, environment } = req;
  const { provider } = params;
  let authType = '';
  if (provider) {
    authType = 'auth-provider';
  } else {
    authType = 'login';
  }

  passport.authenticate(authType, { session: false }, (err, user, info) => {
    if (err) {
      console.error('err loginWithProvider :>> ', err);
      return res.status(err.status).json({ message: err.message });
    }
    let redirectTo = '';
    if (info !== undefined) {
      const { message } = info;
      if (message === 'REDIRECT_TO_REGISTER') {
        redirectTo = 'REGISTER';
      } else if (message === 'REDIRECT_TO_VERIFY') {
        redirectTo = 'VERIFY';
      } else {
        return res.status(info.status || 500).json({ message: info.message });
      }
    }
    if (user) {
      req.login(user, { session: false }, async (err) => {
        if (err) {
          console.error('err ************ :>> ', err, user);
          return res.status(500).json(err);
        }
        let finalData = {};
        let userDetails = null;
        let role = user.role;
        if (provider) {
          userDetails = user.user;
        } else {
          userDetails = user;
        }
        userDetails = cleanUserItem(userDetails);
        const userCollection = await userCollectionService(projectId);
        if (!userCollection) {
          return { code: 404, message: 'User collection not found' };
        }
        const { permissionLevelSecurity } = userCollection || {};
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
          delete tenant._id;
          if (userSetting) {
            delete userSetting._id;

            if (userSetting && userSetting.userRoles && userSetting.userRoles.length) {
              const userTenantRoleName = userSetting.userRoles[0];
              let userTenantRole = '';
              if (userTenantRoleName) {
                userTenantRole = await findOneItemByQuery(db, roleCollectionName, {
                  name: userTenantRoleName,
                });
                if (userTenantRole) {
                  role = userTenantRole.uuid;
                  userDetails.role = userTenantRole.uuid;
                  if (
                    info &&
                    info.message &&
                    (info.message === 'REDIRECT_TO_VERIFY' ||
                      info.message === 'REDIRECT_TO_REGISTER')
                  ) {
                    userDetails.userRoles = ['TWO_FACTOR_VERIFY', userTenantRoleName];
                    userSetting.userRoles = ['TWO_FACTOR_VERIFY', ...userSetting.userRoles];
                  } else {
                    userDetails.userRoles = [userTenantRoleName];
                  }
                }
              }
            }
          }
        }
        if (subTenant) delete subTenant._id;

        // Filter the user object to only include specified fields based on permission level security
        userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);

        if (provider) {
          if (provider === PROVIDER_TYPE.XANO) {
            finalData = {
              auth: true,
              token: user.token,
              expiresIn: 3600,
              userDetails,
              role,
              tenant,
              userSetting,
              subTenant,
              projectId: projectId,
            };
          }
        } else {
          delete user.role;

          finalData = {
            auth: true,
            userDetails,
            role,
            tenant,
            userSetting,
            subTenant,
            projectId: projectId,
            redirectTo,
          };

          if (redirectTo !== 'VERIFY') {
            const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(
              projectId,
              environment,
            );
            const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);
            finalData.token = tokenObject.token;
            finalData.expiresIn = tokenObject.expires;
          }
        }
        return res.status(200).json(finalData);
      });
    }
  })(req, res, next);
};

export const loginUserWithToken = async (req, res, next) => {
  const { projectId, db, environment } = req;
  passport.authenticate('jwt-login', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (info !== undefined) {
      return res.status(info.status || 500).json({ message: info.message });
    }
    if (user) {
      req.login(user, { session: false }, async (err) => {
        if (err) {
          return res.status(500).json(err);
        }
        delete user.password;
        delete user.updatedAt;
        delete user._id;
        const role = user.role;
        delete user.role;
        const userCollection = await userCollectionService(projectId);
        if (!userCollection) {
          return { code: 404, message: 'User collection not found' };
        }
        const { permissionLevelSecurity } = userCollection || {};
        let userDetails = await decryptUser(projectId, user, userCollection);
        const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
        const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);
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
          await handleMultiTenantLoginProcess(
            db,
            userDetails,
            role,
            tenant,
            subTenant,
            userSetting,
          );
        }

        // Filter the user object to only include specified fields based on permission level security
        userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);
        console.log('loginUserWithToken');
        return res.status(200).json({
          auth: true,
          token: tokenObject.token,
          expiresIn: tokenObject.expires,
          userDetails: userDetails,
          role,
          tenant,
          userSetting,
          subTenant,
        });
      });
    }
  })(req, res, next);
};

export const getTenantByTenantId = async (req, res) => {
  try {
    const { params, projectId, db } = req;
    const { tenantId } = params;
    const tenant = await getTenantById(db, projectId, tenantId);
    res.status(200).json(tenant);
  } catch (error) {
    console.error('\n Error:=>', error);
  }
};

export const getUserSettingByUserSettingId = async (req, res) => {
  try {
    const { params, projectId, db } = req;
    const { userSettingId } = params;
    const userSetting = await getUserSettingById(db, projectId, userSettingId);
    res.status(200).json(userSetting);
  } catch (error) {
    console.error('\n Error:=>', error);
  }
};

export const updateTenantPermission = async (req, res) => {
  const { params, projectId, db, body, enableAuditTrail } = req;
  try {
    const tenant = await updateTenantPermissionsService(
      db,
      projectId,
      enableAuditTrail,
      params.tenantId,
      body,
    );
    req.tenant = tenant;
    return res.status(200).json(tenant);
  } catch (error) {
    console.error('\n Error:=>', error);
  }
};

export const updateUserPermission = async (req, res) => {
  const { params, projectId, db, body, enableAuditTrail } = req;
  try {
    const user = await updateUserPermissionsService(
      db,
      projectId,
      enableAuditTrail,
      params.userId,
      body,
    );
    return res.status(200).json(user);
  } catch (error) {
    console.error('\n Error:=>', error);
  }
};

export const updateUserSettingsPermission = async (req, res) => {
  const { params, projectId, db, body, enableAuditTrail } = req;
  try {
    const user = await updateUserSettingsPermissionsService(
      db,
      projectId,
      enableAuditTrail,
      params.userSettingsId,
      body,
    );
    return res.status(200).json(user);
  } catch (error) {
    console.error('\n Error:=>', error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { db, body, projectId } = req;
    const { sendTo } = body;
    const userCollection = await userCollectionService(projectId);
    let user = await getSendToUser(db, projectId, userCollection, sendTo);

    if (!user) return res.status(404).send({ message: "User with this email doesn't exist" });

    const resetCheck = await checkAndUpdateUserPasswordResetAttempts(db, user);
    if (resetCheck.errorMsg) return res.status(404).send({ message: resetCheck.errorMsg });
    user = resetCheck.newUser;
    const result = await sendEmailTemplateService(req, user);
    res.status(result.code).send(result);
  } catch (error) {
    console.error('\n errror::', error);
    next(error);
  }
};

export const generateAndSendEmailOTP = async (req, res, next) => {
  try {
    const { body, db, projectId, headers, environment, tenant, enableAuditTrail } = req;
    const { email, emailTemplate, otpAuthenticationType, password, emailServicePlugin } = body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const response = await generateAndSendEmailOtpService({
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
    });
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in generateAndSendEmailOTP:', error);
    next(error);
  }
};

export const generateAndSendSmsOTP = async (req, res, next) => {
  try {
    const { body, db, projectId, headers, environment, tenant, enableAuditTrail } = req;
    const {
      phone_number,
      smsTemplate,
      otpAuthenticationType,
      password,
      smsServicePlugin,
      dltTemplateId = '',
      smsType = '',
    } = body;
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone Number is required.' });
    }
    const response = await generateAndSendSmsOtpService({
      db,
      projectId,
      enableAuditTrail,
      phone_number,
      smsTemplate,
      otpAuthenticationType,
      password,
      headers,
      environment,
      tenant,
      smsServicePlugin,
      dltTemplateId,
      smsType,
    });
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in generateAndSendSmsOTP:', error);
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  const { projectId, db, params } = req;
  const { userUniqueKey } = params;
  const emailQuery = { email: { $regex: `^${userUniqueKey}$`, $options: 'i' } };
  const usernameQuery = { userName: { $regex: `^${userUniqueKey}$`, $options: 'i' } };
  const uuidQuery = { uuid: userUniqueKey };
  const query = { $or: [uuidQuery, emailQuery, usernameQuery] };
  try {
    const userCollection = await userCollectionService(projectId);
    let { data: user } = await findItemById(db, projectId, userCollection, null, query);
    if (user) {
      delete user._id;
      delete user.updatedAt;
      delete user.password;
      res.status(200).send(user);
    } else res.status(404).send({ message: 'User not Found.' });
  } catch (error) {
    console.error('\n error', error);
    next();
  }
};

export const generateEmailOTP = async (req, res, next) => {
  try {
    const { body, db, projectId, headers, environment, enableAuditTrail } = req;
    const { email, otpAuthenticationType, password } = body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const response = await generateEmailOtpService({
      db,
      projectId,
      enableAuditTrail,
      email,
      otpAuthenticationType,
      password,
      headers,
      environment,
    });
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in generateEmailOTP:', error);
    next(error);
  }
};

export const generateSmsOTP = async (req, res, next) => {
  try {
    const { body, db, projectId, headers, environment, enableAuditTrail } = req;
    const { phone_number, otpAuthenticationType, password } = body;
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone Number is required.' });
    }
    const response = await generateSmsOtpService({
      db,
      projectId,
      enableAuditTrail,
      phone_number,
      otpAuthenticationType,
      password,
      headers,
      environment,
    });
    return res.status(response.code).send(response);
  } catch (error) {
    console.error('Error in generateSmsOTP:', error);
    next(error);
  }
};

export const addUserWithMultiTenantFields = async (req, res, next) => {
  try {
    const { db, body, projectId, enableAuditTrail, environment } = req;
    const { userData, eventConfig } = body;
    const response = await saveUserWithMultiTenantFields(
      db,
      projectId,
      enableAuditTrail,
      environment,
      userData,
      eventConfig,
    );
    return res.status(response.code).send(response.data);
  } catch (err) {
    next(err);
  }
};

export const processCheckToken = async (_req, res, next) => {
  try {
    res.status(200).send({ message: 'Token is Alive' });
  } catch (error) {
    console.error('\n error', error);
    next();
  }
};
