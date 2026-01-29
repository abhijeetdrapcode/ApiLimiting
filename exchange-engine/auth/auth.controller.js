import passport from 'passport';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { pluginCode } from 'drapcode-constant';
import { loadEvent } from 'drapcode-utility';
import {
  findAllInstalledPlugin,
  findInstalledPlugin,
} from '../install-plugin/installedPlugin.service';
import { decodeSecretCode, encodeSecretCode } from './auth.service';
import { userCollectionName } from '../security/loginUtils';
import { processItemById } from '../item/item.service';
import { findOneCollectionService } from '../collection/collection.service';
import { getTokenExpireTime, issueJWTToken, logoutUserToken } from '../security/jwtUtils';
import { disableQRCode, updateUserForSecurity } from '../totp/totp.service';
import {
  loginWithTwoFactor,
  verifyEmailOtpAndLoginService,
  verifySmsOtpAndLoginService,
} from '../loginPlugin/user.service';
import { extractUserSettingFromUserAndTenant } from '../tenant/tenant.service';

export const loginUser = async (req, res, next) => {
  const { params, projectId, environment } = req;
  const { provider } = params;
  const authType = provider ? 'auth-provider' : 'local-login';

  passport.authenticate(authType, { session: true }, (err, userPayload, info) => {
    console.log(`local-login passport authenticated`, JSON.stringify({ err, userPayload, info }));
    if (err) {
      return res.status(err.status || 500).json({ message: err.error || err.message });
    }
    if (info?.message) {
      return res.status(info.status || 403).json(info);
    }
    if (!userPayload) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    req.login(userPayload, async (err) => {
      if (err) return res.status(500).json(err);

      const {
        userDetails,
        role,
        tenant,
        subTenant,
        userSetting,
        redirectTo,
        provider,
        token: providerToken,
      } = userPayload;

      let finalData = {
        auth: true,
        userDetails,
        role,
        tenant,
        subTenant,
        userSetting,
        projectId,
        redirectTo,
      };

      // XANO provider returns token from provider
      if (provider === 'XANO') {
        finalData.token = providerToken;
        finalData.expiresIn = 3600;
        return res.status(200).json(finalData);
      }

      // Normal JWT flow
      if (redirectTo !== 'VERIFY') {
        const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
        const tokenObject = await issueJWTToken(userDetails, tokenExpiry, inActivityLimit);

        finalData.token = tokenObject.token;
        finalData.expiresIn = tokenObject.expires;
      }

      return res.status(200).json(finalData);
    });
  })(req, res, next);
};

export const loginUserWithExternalAPI = async (req, res, next) => {
  passport.authenticate('external-api-login', { session: true }, (err, user, info) => {
    console.log(`external-api-login loginUserWithExternalAPI`, JSON.stringify({ err, user, info }));
    if (err) {
      return res.status(err.status ? err.status : 500).json(err);
    }
    if (info !== undefined) {
      return res.status(info.status || 200).json({ message: info.message });
    }

    if (user) {
      req.logIn(user, { session: true }, async (err) => {
        console.log('loginUserWithExternalAPI err %s% :>> ', err);
        if (err) {
          return res.status(500).json(err);
        }

        return res.status(200).json(user);
      });
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  })(req, res, next);
};

export const loginUserWithToken = async (req, res, next) => {
  passport.authenticate('jwt-login', { session: true }, (err, user, info) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (info !== undefined) {
      return res.status(info.status || 200).json({ message: info.message });
    }
    if (user) {
      req.login(user, { session: true }, async (err) => {
        if (err) {
          return res.status(500).json(err);
        }
        user.projectId = req.projectId;
        return res.status(200).json(user);
      });
    }
  })(req, res, next);
};

export const magicLinkLogin = async (req, res, next) => {
  console.log('Magic Login Testing');
  const { db } = req;
  const token = req.query.token;
  req.body.token = token;
  req.headers.authorization = `Bearer ${token}`;
  console.log('req.body :>> ', req.body);
  console.log('req.headers :>> ', req.headers);

  passport.authenticate('jwt-login', { session: true }, (err, user, info) => {
    console.log('err :>> ', err);
    console.log('info :>> ', info);
    if (err) {
      return res.redirect('/login');
    }
    if (info !== undefined) {
      return res.redirect('/login');
    }
    if (user) {
      req.login(user, { session: true }, async (err) => {
        console.log('err :>> ', err);
        if (err) {
          return res.redirect('/login');
        }
        const { projectId } = req;
        console.log('projectId :>> ', projectId);
        try {
          user.projectId = projectId;
          let redirectPage = '/home';
          let tenantData = '';
          let userSettingData = '';
          console.log('11');
          const installedPlugins = await findAllInstalledPlugin(projectId);
          console.log('12');
          const magicLinkLoginPlugin = installedPlugins.find(
            (e) => e.code === pluginCode.MAGIC_LINK_LOGIN,
          );
          console.log('13');
          const multiTenantSaasPlugin = installedPlugins.find(
            (e) => e.code === pluginCode.MULTI_TENANT_SAAS,
          );
          if (magicLinkLoginPlugin) {
            console.log('14');
            const magicLinkLoginEvent = await loadEvent(
              projectId,
              magicLinkLoginPlugin.setting.eventId,
            );
            console.log('15');
            const redirectRules = magicLinkLoginEvent
              ? magicLinkLoginEvent.actions
                  .find((e) => e.name === 'loginUser')
                  .parameters.find((e) => e.name === 'redirectRules').value
              : [];
            console.log('redirectRules :>> ', redirectRules);
            const { userRoles } = user.userDetails || {};
            if (redirectRules) {
              const redirectUrl = redirectRules.find((redirectRule) => {
                if (Array.isArray(userRoles)) {
                  return userRoles.includes(redirectRule.role);
                } else {
                  return redirectRule.role === userRoles;
                }
              });
              redirectPage = redirectUrl ? redirectUrl.page : '/home';
            }
          }
          if (multiTenantSaasPlugin) {
            const { tenantId } = user.userDetails || {};
            tenantData = tenantId && tenantId.length ? tenantId[0] : '';
            userSettingData = await extractUserSettingFromUserAndTenant(
              db,
              projectId,
              user.userDetails,
              tenantData,
            );
          }
          /**
           * ?INFO: Handling apostrophe in the JSON by replacing it with '##@apos@##'
           * afterwards, replacing '##@apos@##' with single quote again to keep the JSON string valid.
           **/
          res.write(`
              <script>
                (function() {
                  const localStorage = window.localStorage;
                  const user = JSON.parse('${serializeObject(user.userDetails)}');
                  const tenant = JSON.parse('${serializeObject(tenantData)}');
                  const userSetting = JSON.parse('${serializeObject(userSettingData)}');
                  localStorage.setItem('token', "${user.token}");
                  localStorage.setItem('user', JSON.stringify(user));
                  if (tenant) {
                    localStorage.setItem('tenant', JSON.stringify(tenant));
                  }
                  if (userSetting) {
                    localStorage.setItem('userSetting', JSON.stringify(userSetting));
                  }
                  localStorage.setItem('projectId', "${user.projectId}");
                  localStorage.setItem('role', "${user.role}");
            
                  window.location = '${redirectPage}';
                })();
              </script>
            `);

          res.end();
        } catch (err) {
          console.log('==> Error :>> ', err);
          res.redirect('/login');
        }
      });
    }
  })(req, res, next);
};

const serializeObject = (object) => {
  if (!object) {
    return 'null';
  }
  return JSON.stringify(object).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
};

export const logoutUser = async (req, res) => {
  const { headers } = req;
  const token = headers.authorization?.split(' ')[1]; // Bearer <token
  await logoutUserToken(token);
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    res.status(200).json({ message: 'Successfully logged out' });
  });
};

export const refreshLoggedInUser = async (req, res) => {
  console.log('*** Going to refresh Current LoggedIn User...:');
  const { projectId, user } = req;
  if (!user || !Object.keys(user).length) {
    return res.status(404).json(user);
  }

  const collection = await findOneCollectionService(projectId, userCollectionName);
  if (!collection) {
    return { code: 200, message: 'success', result: 0, count: 0 };
  }
  const { db, headers, environment } = req;
  const { authorization } = headers;
  const result = await processItemById(db, projectId, collection, user.uuid, authorization);
  if (!result) {
    //TODO: Handle if no details found
    return res.status(200).json(user);
  }

  const { data } = result;
  const { tokenExpiry, inActivityLimit } = await getTokenExpireTime(projectId, environment);
  const tokenObject = await issueJWTToken(result.data, tokenExpiry, inActivityLimit);

  data.expiresIn = tokenObject.expires;
  const updatedUserData = {
    userDetails: data,
    role: user.role,
    token: tokenObject.token,
  };

  console.log('*** Refreshing Current LoggedIn User...:');
  req.logIn(updatedUserData, { session: true }, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    req.user.projectId = req.projectId;
    req.user = updatedUserData;
    return res.status(200).json(req.user);
  });
  res.end();
};

export const generateSecretCode = async (req, res) => {
  try {
    if (!req.user || Object.keys(req.user).length === 0) {
      return res.status(401).json({ message: 'User not logged in' });
    }
    const { projectId, projectName, user } = req;
    const { is_secret_code_verify, userName } = user;
    if (is_secret_code_verify) {
      return res.status(404).json(req.user);
    }

    const twoAuthPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.TWO_FACTOR_AUTHENTICATION,
    );
    if (!twoAuthPlugin) {
      return res.status(404).json(req.user);
    }
    let appName = twoAuthPlugin.setting?.name || projectName;

    const secret_code = authenticator.generateSecret();
    user.secret_code = encodeSecretCode(secret_code);

    const email = userName;
    const url = await QRCode.toDataURL(authenticator.keyuri(email, appName, secret_code));

    const updatedUserData = {
      userDetails: user,
      role: user.role,
      token: user.token,
    };

    console.log('*** Refreshing Current LoggedIn User...:');
    req.logIn(updatedUserData, { session: true }, async (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      req.user = updatedUserData;
      req.user.projectId = req.projectId;
      console.log('updatedUserData', updatedUserData);
      return res.status(200).json({ user: updatedUserData, url });
    });
  } catch (error) {
    console.error('generateSecretCode ERROR:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const verifySecretCode = async (req, res) => {
  if (!req.user || Object.keys(req.user).length === 0) {
    return res.status(401).json(req.user);
  }

  const { projectId, projectName, user, body } = req;
  console.log('1: verifySecretCode user', user);
  const { code } = body;
  if (!code) {
    return res.status(400).json(req.user);
  }

  let { userName, secret_code } = user;

  secret_code = decodeSecretCode(secret_code);
  const isValid = authenticator.check(code, secret_code);

  if (!isValid) {
    console.log('Code is not verified');
    const twoAuthPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.TWO_FACTOR_AUTHENTICATION,
    );
    if (!twoAuthPlugin) {
      return res.status(404).json(req.user);
    }
    let appName = twoAuthPlugin.setting?.name || projectName;

    const newSecret = authenticator.generateSecret();
    user.secret_code = encodeSecretCode(newSecret);

    const url = await QRCode.toDataURL(authenticator.keyuri(userName, appName, newSecret));

    const updatedUserData = {
      userDetails: user,
      role: user.role,
      token: user.token,
    };
    console.log('2: updatedUserData', JSON.stringify(updatedUserData));

    console.log('*** Token Not Verified, refreshing user with new secret...:');
    req.logIn(updatedUserData, { session: true }, async (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      req.user = updatedUserData;
      req.user.projectId = req.projectId;
      return res.status(200).json({ success: false, user: req.user, url });
    });
    return;
  }

  console.log('Code is verified');
  const updatedUser = await updateUserForSecurity(req.db, user.uuid, user.secret_code);

  console.log('3: updatedUser', JSON.stringify(updatedUser));
  const updatedUserData = {
    userDetails: updatedUser,
    role: user.role,
    token: user.token,
  };

  console.log('*** Refreshing Current LoggedIn User...:');
  req.logIn(updatedUserData, { session: true }, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    req.user = updatedUserData;
    req.user.projectId = req.projectId;
    return res.status(200).json({ user: req.user, success: true });
  });
};

export const authorizeSecretCode = async (req, res) => {
  if (!req.user || Object.keys(req.user).length === 0) {
    return;
  }
  const { user, body } = req;
  let { secret_code, uuid } = user;
  secret_code = decodeSecretCode(secret_code);
  const { verify_code } = body;
  if (!authenticator.check(verify_code, secret_code)) {
    return res.status(403).json({ success: false });
  }
  const { db, projectId, environment } = req;
  const userData = await loginWithTwoFactor(db, projectId, environment, uuid);
  console.log('user in refreshUserTOTPData', userData);

  req.logIn(userData, { session: true }, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    req.user.projectId = req.projectId;
    req.user = userData;
    return res.status(200).json(req.user);
  });
};

export const resetSecretCode = async (req, res) => {
  if (!req.user || Object.keys(req.user).length === 0) {
    return;
  }
  const { db, projectId, projectName, user } = req;
  const updatedUser = await disableQRCode(db, user.uuid);
  console.log('resetSecretCode updatedUser', updatedUser);
  const twoAuthPlugin = await findInstalledPlugin(projectId, pluginCode.TWO_FACTOR_AUTHENTICATION);
  let appName = projectName;
  if (twoAuthPlugin.setting.name) {
    appName = twoAuthPlugin.setting.name;
  }
  const secret_code = authenticator.generateSecret();
  updatedUser.secret_code = encodeSecretCode(secret_code);

  const email = updatedUser.userName;
  const url = await QRCode.toDataURL(authenticator.keyuri(email, appName, secret_code));

  const updatedUserData = {
    userDetails: updatedUser,
    role: user.role,
    token: user.token,
  };

  console.log('*** Refreshing Current LoggedIn User...:');
  req.logIn(updatedUserData, { session: true }, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    req.user.projectId = req.projectId;
    req.user = updatedUserData;
    console.log('*****************************');
    return res.status(200).json({ user: req.user, success: true, url });
  });
  console.log('*************dd****************');
};

export const authorizeEmailOTPCode = async (req, res) => {
  const { db, projectId, body, enableAuditTrail, environment, headers } = req;
  const { otp, emailOtpToken } = body;
  const result = await verifyEmailOtpAndLoginService({
    db,
    projectId,
    enableAuditTrail,
    otp,
    emailOtpToken,
    headers,
    environment,
  });

  const user = result.data;
  req.logIn(user, { session: true }, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    req.user.projectId = req.projectId;
    req.user = user;
    return res.status(200).json(user);
  });
};

export const authorizeSmsOTPCode = async (req, res) => {
  const { db, projectId, body, enableAuditTrail, headers, environment } = req;
  const { otp, smsOtpToken } = body;

  const result = await verifySmsOtpAndLoginService({
    db,
    projectId,
    enableAuditTrail,
    otp,
    smsOtpToken,
    headers,
    environment,
  });

  const user = result.data;
  req.logIn(user, { session: true }, async (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    req.user.projectId = req.projectId;
    req.user = user;
    return res.status(200).json(user);
  });
};
