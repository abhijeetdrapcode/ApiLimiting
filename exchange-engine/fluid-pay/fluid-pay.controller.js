import { prepareAndProcessFluidPay } from './fluid-pay.service';
import { replaceValueFromSource } from 'drapcode-utility';
import { logger } from 'drapcode-logger';
import { multiTenantCollService } from '../collection/collection.service';
import { getItemToPurchase } from '../item/item.service';
import { getFluidPayExtension } from '../install-plugin/installedPlugin.service';
export const createFluidPayToken = async (req, res, next) => {
  const { db, projectId, tenant, environment, body } = req;
  let collectionTenant = null;
  const { tenantUuid, isTenantFromRecord } = body;
  if (isTenantFromRecord) {
    if (tenantUuid) {
      //Get Collection Tenant Item
      let multiTenantCollection = await multiTenantCollService(projectId);
      if (multiTenantCollection) {
        multiTenantCollection = multiTenantCollection.collectionName;
        collectionTenant = await getItemToPurchase(
          db,
          projectId,
          multiTenantCollection,
          tenantUuid,
        );
      }

      collectionTenant = collectionTenant ? collectionTenant : null;
    }
  } else {
    collectionTenant = tenant;
  }
  try {
    const fluidPaySetting = await getFluidPayExtension(projectId);
    let { publicKey, isShipping, isBilling, isUser } = fluidPaySetting.setting;
    publicKey = replaceValueFromSource(publicKey, environment, collectionTenant);
    logger.info(`apiKey Fluid Pay Setting: ${publicKey}`);
    res.json({ api_key: publicKey, isShipping, isBilling, isUser }).status(200);
  } catch (error) {
    next(error);
  }
};

export const processFluidPayToken = async (req, res, next) => {
  const { db, projectId, user, tenant, environment, body } = req;
  try {
    const fluidPaySetting = await getFluidPayExtension(projectId);
    if (!fluidPaySetting) {
      return res.status(400).send({ code: 400, message: 'Fluid Pay plugin not installed' });
    }
    const fluidResponse = await prepareAndProcessFluidPay(
      projectId,
      db,
      user,
      tenant,
      body,
      fluidPaySetting.setting,
      environment,
    );
    if (fluidResponse.status === 'FAILED') {
      return res.status(fluidResponse.code).json(fluidResponse);
    }
    return res.status(200).json(fluidResponse);
  } catch (error) {
    next(error);
  }
};
