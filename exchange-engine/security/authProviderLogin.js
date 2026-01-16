import { pluginCode } from 'drapcode-constant';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
import { PROVIDER_TYPE, signInWithXano } from '../security/socialAuth';
import { findOneItemByQuery } from '../item/item.service';
import { roleCollectionName, userCollectionName } from './loginUtils';
import { validateEmail } from 'drapcode-utility';
import { generateTemporaryPassword, saveUser } from '../loginPlugin/user.service';

//TODO: Need to test and implement
export const authenticateUserWithProvider = async (req, userName, password, done) => {
  const { db, projectId, params, environment, enableAuditTrail } = req;
  const { provider } = params;
  if (provider !== PROVIDER_TYPE.XANO) {
    return done({ success: false, status: 401, message: 'Invalid provider' });
  }

  const plugin = await findInstalledPlugin(projectId, pluginCode.LOGIN_WITH_XANO);
  if (!plugin) {
    return done({ success: false, status: 401, message: 'No valid provider plugin install' });
  }

  let authResponse = await signInWithXano(environment, plugin.setting, userName, password);

  const { data } = authResponse;
  if (!authResponse.success) {
    return done(authResponse);
  }

  let authEmail = '';
  let uniqueId = '';
  let returnData = {};
  const { authToken, email, id } = data;
  authEmail = email;
  uniqueId = id;
  returnData = {
    token: authToken,
  };
  const emailQuery = { email: { $regex: `^${authEmail}$`, $options: 'i' } };
  const usernameQuery = { userName: { $regex: `^${authEmail}$`, $options: 'i' } };
  const query = { $or: [emailQuery, usernameQuery] };
  try {
    let user = await findOneItemByQuery(db, userCollectionName, query);
    if (!user) {
      const newUser = {
        email: validateEmail(authEmail) ? authEmail : '',
        userName: authEmail,
        uuid: uniqueId,
        password: generateTemporaryPassword(),
        userRoles: 'User',
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
    return done(null, {
      user,
      ...returnData,
      role: role ? role.uuid : '',
    });
  } catch (error) {
    console.error('error :>> ', error);
    done(error);
  }
};
