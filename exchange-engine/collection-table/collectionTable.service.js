import { v4 as uuidv4 } from 'uuid';
import { createProfilerService, updateProfilerService } from '../profiling/profiler.service';
import { API, COMPUTING } from '../utils/enums/ProfilerType';
import { findCollection } from '../collection/collection.service';
import { filterItemService } from '../item/item.service';
import { cryptService } from '../middleware/encryption.middleware';
import { checkPermissionLevelSecurity } from '../item/item.utils';

export const collectionFilterItems = async (
  db,
  projectObj,
  paramsObj,
  tenantObj,
  headers,
  query,
) => {
  const apiEnterUuid = uuidv4();
  const { projectId, project, enableProfiling } = projectObj;
  const { collectionName, filterId } = paramsObj;
  const { tenant, subTenant } = tenantObj;
  let collection = await findCollection(projectId, collectionName, filterId);
  if (!collection) {
    return { code: 400, message: 'No Collection found', error: 'No Collection found' };
  }

  try {
    createProfilerService(
      db,
      projectId,
      enableProfiling,
      apiEnterUuid,
      API,
      `COLLECTION TABLE -> collectionTableFilterItems`,
      {
        collectionName,
      },
    );
    const { authorization } = headers;

    const { permissionLevelSecurity = [] } = collection;
    let { code, result, message } = await filterItemService(
      db,
      projectId,
      collection,
      filterId,
      query,
      authorization,
      project.timezone,
      headers,
      0,
      1,
      false,
      project.dateFormat,
      tenant,
      subTenant,
    );
    if (code != 200) {
      return { code, result, message };
    }
    const computingStartUuid = uuidv4();
    createProfilerService(
      db,
      projectId,
      enableProfiling,
      computingStartUuid,
      COMPUTING,
      `COLLECTION TABLE -> collectionTableFilterItems Crypt Service`,
      { collectionName },
    );
    let encryptedResponse;
    if (result) {
      encryptedResponse = await cryptService(result, projectId, collection, true, false, true);
    }
    if (encryptedResponse) {
      if (encryptedResponse.status === 'FAILED') {
        return { code: 400, message: encryptedResponse.message, error: encryptedResponse.message };
      } else {
        result = encryptedResponse;
      }
    }
    if (permissionLevelSecurity && permissionLevelSecurity.length) {
      result = await checkPermissionLevelSecurity(
        db,
        projectId,
        authorization,
        permissionLevelSecurity,
        result,
      );
    }
    updateProfilerService(db, projectId, enableProfiling, computingStartUuid);
    updateProfilerService(db, projectId, enableProfiling, apiEnterUuid);

    return { code: code, result, message: message, error: message };
  } catch (error) {
    return { code: 400, message: error.message, error: error.message };
  }
};
