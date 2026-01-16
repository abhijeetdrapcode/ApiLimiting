import { checkCollectionByName } from '../collection/collection.service';
import { saveItem } from '../item/item.service';
import { createAuditTrail } from '../logs/audit/audit.service';
import { isNew } from '../utils/appUtils';

export const createOrUpdatePlaidSettingOfUser = async (
  dbConnection,
  projectId,
  environment,
  enableAuditTrail,
  user,
  tenant,
  access_token,
  item_id,
  asset_report_token,
  asset_report_id,
) => {
  try {
    if (!item_id) {
      return { success: false, message: 'No Plaid Item ID found.' };
    }

    const query = {
      plaid_item_id: item_id,
      $or: [{ user: { $in: [user.uuid] } }, { tenantId: { $in: [tenant ? tenant.uuid : ''] } }],
    };
    let plaidConnection = await dbConnection.collection('plaid_setting');
    let existingPlaidSetting = await plaidConnection.findOne(query);
    let oldValues = Object.assign({}, existingPlaidSetting);

    if (existingPlaidSetting) {
      existingPlaidSetting.plaid_access_token = access_token;
      existingPlaidSetting.plaid_item_id = item_id;
      existingPlaidSetting.plaid_asset_report_token = asset_report_token;
      existingPlaidSetting.plaid_asset_report_id = asset_report_id;
      delete existingPlaidSetting.uuid;
      const newPlaidSetting = { $set: existingPlaidSetting };
      //FINAL: START:Audit Trail
      createAuditTrail(
        dbConnection,
        enableAuditTrail,
        'SYSTEM',
        'update',
        '',
        'plaid_setting',
        existingPlaidSetting,
        oldValues,
      );
      // END:Audit Trail
      existingPlaidSetting = await plaidConnection.findOneAndUpdate(query, newPlaidSetting, isNew);
      return { success: true, message: 'Plaid Setting updated successfully' };
    }
    existingPlaidSetting = {
      user: user.uuid,
      tenantId: tenant ? tenant.uuid : '',
      plaid_access_token: access_token,
      plaid_item_id: item_id,
      plaid_asset_report_token: asset_report_token,
      plaid_asset_report_id: asset_report_id,
    };
    const collection = await checkCollectionByName(projectId, 'plaid_setting');
    const response = await saveItem(
      dbConnection,
      projectId,
      environment,
      enableAuditTrail,
      collection,
      existingPlaidSetting,
      '',
      user,
      {},
    );
    if (response.code === 400) {
      return {
        status: 'failed',
        message: 'Failed to Save',
      };
    } else {
      return {
        success: true,
        message: 'Plaid Setting created successfully',
      };
    }
  } catch (error) {
    return { success: false, message: error };
  }
};
