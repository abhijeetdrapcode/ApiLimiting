import { userCollectionService } from '../collection/collection.service';
import { executeExternalApiAndProcess } from '../external-api/external-api.service';
import { findOneItemByQuery } from '../item/item.service';
import { getTokenExpireTime, issueJWTToken } from '../security/jwtUtils';
import { cleanUserItem } from '../loginPlugin/user.service';
import {
  extractFirstSubTenantIdFromUserAndTenantId,
  extractFirstTenantIdFromUser,
  extractUserSettingFromUserAndTenant,
  getSubTenantById,
  getTenantById,
} from '../tenant/tenant.service';
import {
  roleCollectionName,
  handleMultiTenantLoginProcess,
  processUserWithPLS,
} from './loginUtils';

export const authenticateUserWithExternalAPI = async (req, userName, password, done) => {
  try {
    const { projectId, db, params, body, project, environment, enableProfiling, enableAuditTrail } =
      req;
    const { collectionItemId } = params;
    const result = await executeExternalApiAndProcess(
      db,
      projectId,
      enableAuditTrail,
      collectionItemId,
      body,
      project.projectConstants,
      null,
      null,
      null,
      null,
      environment,
      enableProfiling,
    );

    if (!result.success) return done(result);

    const user = result.responseData;
    let role = '';
    if (user.userRoles?.length)
      role = await findOneItemByQuery(db, roleCollectionName, { name: user.userRoles[0] });

    let userDetails = user;
    let roleId = role?.uuid || '';
    userDetails = cleanUserItem(userDetails);

    const userCollection = await userCollectionService(projectId);
    if (!userCollection) {
      return { code: 404, message: 'User collection not found' };
    }

    const { permissionLevelSecurity } = userCollection || {};
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

    // Filter the user object to only include specified fields based on permission level security
    userDetails = processUserWithPLS(permissionLevelSecurity, userDetails);

    const finalData = {
      auth: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      userDetails,
      role: roleId,
      tenant,
      userSetting,
      subTenant,
      projectId,
    };

    return done(null, finalData);
  } catch (err) {
    console.error('External API auth error:', err);
    done(err);
  }
};
