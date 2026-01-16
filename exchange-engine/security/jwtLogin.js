import { pluginCode } from 'drapcode-constant';
import { userCollectionService } from '../collection/collection.service';
import { findItemById, findOneItemByQuery } from '../item/item.service';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
import {
  handleMultiTenantLoginProcess,
  processUserWithPLS,
  roleCollectionName,
} from './loginUtils';
import { decryptUser } from '../loginPlugin/user.service';
import { getTokenExpireTime, issueJWTToken } from './jwtUtils';
import {
  extractFirstSubTenantIdFromUserAndTenantId,
  extractFirstTenantIdFromUser,
  extractUserSettingFromUserAndTenant,
  getSubTenantById,
  getTenantById,
} from '../tenant/tenant.service';

export const authenticateUserWithToken = async (req, jwt_payload, done) => {
  console.log('Testing magic login');
  try {
    const { db, projectId, environment } = req;
    const query = { userName: jwt_payload.sub };
    console.log('query :>> ', query);
    const userCollection = await userCollectionService(projectId);
    if (!userCollection)
      return done(null, false, { message: 'User collection not found', status: 404 });

    const { data: user } = await findItemById(db, projectId, userCollection, null, query);
    if (!user) return done(null, false, { message: 'Invalid Token', status: 404 });

    const plugin = await findInstalledPlugin(projectId, pluginCode.LOGIN);
    const { is_email_verified, is_enabled } = plugin?.setting || {};
    if (is_email_verified && !user.is_email_verified)
      return done(null, false, { message: 'Email not verified', status: 401 });

    if (is_enabled && !user.is_enabled)
      return done(null, false, { message: 'Account disabled', status: 401 });

    let role = '';
    if (user.userRoles?.length)
      role = await findOneItemByQuery(db, roleCollectionName, { name: user.userRoles[0] });

    const roleId = role?.uuid;

    delete user.password;
    delete user.updatedAt;
    delete user._id;

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
      await handleMultiTenantLoginProcess(db, userDetails, role, tenant, subTenant, userSetting);
    }

    userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);

    const output = {
      auth: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      userDetails: userDetails,
      role: roleId,
      tenant,
      userSetting,
      subTenant,
    };

    return done(null, output);
  } catch (err) {
    done(err);
  }
};
