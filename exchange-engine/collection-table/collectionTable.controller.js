import { v4 as uuidv4 } from 'uuid';
import { existsSync, unlinkSync } from 'fs';
import { findItemById, list, filterItemService, dataViewLogs } from '../item/item.service';
import {
  checkCollectionByName,
  findCollection,
  findOneCollectionService,
} from '../collection/collection.service';
import {
  checkDerivedFieldMapping,
  checkPermissionLevelSecurity,
  createCSVFile,
} from '../item/item.utils';
import { cryptService } from '../middleware/encryption.middleware';
import { createProfilerService, updateProfilerService } from '../profiling/profiler.service';
import { API, COMPUTING } from '../utils/enums/ProfilerType';
import { stringify } from 'csv-stringify';
import { promisify } from 'util';
import { collectionFilterItems } from './collectionTable.service';
import { processFileFieldForURL } from '../upload-api/fileUpload.service';

const stringifyAsync = promisify(stringify);

export const collectionTableItems = async (req, res, next) => {
  try {
    const { db, params, projectId, body, query } = req;
    const ids = body.ids || query.ids;
    const reqQuery = query;
    const { collectionName } = params;
    const collection = await checkCollectionByName(projectId, collectionName);
    if (!collection) {
      return { code: 404, data: `Collection not found with provided name` };
    }
    let result = await list(db, projectId, collection, ids, reqQuery, true);
    if (!result) {
      return res.status(200).send([]);
    }
    return res.status(200).send(result);
  } catch (err) {
    next(err);
  }
};

export const exportFilterItems = async (req, res, next) => {
  try {
    const { db, params, headers, query, projectId, tenant, project, subTenant } = req;
    const { collectionName, filterId } = params;
    const { authorization } = headers;
    let collection = await findCollection(projectId, collectionName, filterId);
    if (!collection) {
      return res.status(400).send('No Collection found');
    }

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
    if (code !== 200) {
      return res.status(code).send(message);
    }
    let fileName = uuidv4();
    let localFilePath = process.env.FILE_UPLOAD_PATH || '/tmp/drapcode-uploads/';
    const exportFileName = `${collectionName}_${fileName}.csv`;
    localFilePath += exportFileName;
    if (existsSync(localFilePath)) {
      unlinkSync(localFilePath);
    }
    let encryptedResponse;
    if (result) {
      encryptedResponse = await cryptService(result, projectId, collection, true, false, true);
    }
    if (encryptedResponse) {
      if (encryptedResponse.status === 'FAILED') {
        return res.status(422).send(encryptedResponse.message);
      } else {
        result = encryptedResponse;
      }
    }

    const { finalData, headerColumns } = await createCSVFile(collection, localFilePath, result);
    const csvStr = await stringifyAsync(finalData, { header: true, columns: headerColumns });
    res.setHeader('content-type', 'text/csv');
    res.setHeader('content-disposition', `attachment;filename=${encodeURI(exportFileName)}`);
    res.status(200).end(csvStr);
  } catch (err) {
    console.error('\n == exportFilterItems Error: ', err);
    next(err);
  }
};

export const collectionTableFilterItems = async (req, res, next) => {
  try {
    const { db, headers, query, project, params, projectId } = req;
    const { collectionName, filterId } = params;
    const tenantObj = {
      tenant: req.tenant,
      subTenant: req.subTenant,
    };
    const projectObj = {
      projectId,
      project,
      dateFormat: project.dateFormat,
      enableProfiling: req.enableProfiling,
    };
    const paramsObj = { collectionName, filterId };

    const { code, message, result } = await collectionFilterItems(
      db,
      projectObj,
      paramsObj,
      tenantObj,
      headers,
      query,
    );
    let resp = code != 200 ? message : result;
    dataViewLogs(req);
    return res.status(code || 500).send(resp || []);
  } catch (err) {
    next(err);
  }
};

export const collectionTableFilterItemCount = async (req, res, next) => {
  const apiEnterUuid = uuidv4();
  try {
    const { db, params, headers, query, projectId, project, tenant, enableProfiling, subTenant } =
      req;
    const { collectionName, filterId } = params;
    const { authorization } = headers;
    createProfilerService(
      db,
      projectId,
      enableProfiling,
      apiEnterUuid,
      API,
      'COLLECTION TABLE -> collectionTableFilterItemCount',
      { collectionName },
    );
    let collection = await findCollection(projectId, collectionName, filterId);
    if (!collection) {
      return res.status(200).json({ code: 200, message: 'success', result: 0, count: 0 });
    }
    let { code, result, message } = await filterItemService(
      db,
      projectId,
      collection,
      filterId,
      query,
      authorization,
      project.timezone,
      headers,
      1,
      1,
      false,
      project.dateFormat,
      tenant,
      subTenant,
    );
    let resp = code != 200 ? message : result;
    updateProfilerService(db, projectId, enableProfiling, apiEnterUuid);
    res.status(code || 500).send(resp || []);
  } catch (err) {
    next(err);
  }
};

export const findOneItem = async (req, res, next) => {
  const { db, params, projectId, enableProfiling, headers, query, environment } = req;
  const { collectionName, itemId } = params;
  const { derivedFieldMapping = null } = query;
  const { authorization } = headers;
  const apiEnterUuid = uuidv4();
  try {
    createProfilerService(
      db,
      projectId,
      enableProfiling,
      apiEnterUuid,
      API,
      `COLLECTION TABLE -> findOneItem`,
      {
        collectionName,
      },
    );
    const collection = await findOneCollectionService(projectId, collectionName);
    const result = await findItemById(db, projectId, collection, itemId, null);
    if (!result) {
      res.status(404).send({ message: `Record not found with id ${req.params.itemId}` });
      return;
    }
    const cryptEnterUuid = uuidv4();
    createProfilerService(
      db,
      projectId,
      enableProfiling,
      cryptEnterUuid,
      COMPUTING,
      `COLLECTION TABLE -> findOneItem Crypt Service`,
      { collectionName },
    );

    const { permissionLevelSecurity = [], fields } = collection;
    let encryptedResponse;
    if (result && result.data) {
      encryptedResponse = await cryptService(result.data, projectId, collection, true, false, true);
    }
    if (encryptedResponse) {
      if (encryptedResponse.status === 'FAILED') {
        res.status(400).send({ message: encryptedResponse.message });
      } else {
        result.data = encryptedResponse;
      }
    }
    if (
      derivedFieldMapping &&
      collection?.derivedFieldMapping &&
      collection?.derivedFieldMapping.length
    ) {
      result.data = await checkDerivedFieldMapping(
        derivedFieldMapping,
        collection?.derivedFieldMapping,
        result.data,
      );
    }
    result.data = await processFileFieldForURL(result.data, projectId, environment, fields);
    if (permissionLevelSecurity && permissionLevelSecurity.length) {
      result.data = await checkPermissionLevelSecurity(
        db,
        projectId,
        authorization,
        permissionLevelSecurity,
        result.data,
      );
    }
    updateProfilerService(db, projectId, enableProfiling, cryptEnterUuid);
    updateProfilerService(db, projectId, enableProfiling, apiEnterUuid);
    dataViewLogs(req);
    res.status(result.code).send(result.data);
  } catch (error) {
    next(error);
  }
};
