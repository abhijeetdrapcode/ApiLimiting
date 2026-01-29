import {
  extractFirstSubTenantIdFromUserAndTenantId,
  extractFirstTenantIdFromUser,
  getSubTenantById,
  getTenantById,
} from '../tenant/tenant.service';

export const tenantMiddleware = async (req, res, next) => {
  try {
    const { headers, user, db, projectId } = req;
    let tenantId;
    tenantId = headers['x-tenant-id'];
    let subTenantId = headers['x-sub-tenant-id'];
    if (!tenantId) tenantId = extractFirstTenantIdFromUser(user);
    if (!subTenantId)
      subTenantId = await extractFirstSubTenantIdFromUserAndTenantId(db, projectId, user, tenantId);
    req.tenant = await getTenantById(db, projectId, tenantId);
    if (subTenantId) {
      req.subTenant = await getSubTenantById(db, projectId, subTenantId);
    }
    next();
  } catch (error) {
    console.error('\n error :>> ', error);
  }
};
