import { pluginCode } from 'drapcode-constant';
import { findInstalledPlugin, loadS3PluginConfig } from '../install-plugin/installedPlugin.service';
import { collectionNotFoundMessage, pluginNotInstalledMessage } from '../utils/appUtils';
import { findOneCollectionService } from '../collection/collection.service';
import { findItemById, saveBulkDataFromDeveloperAPI, saveItem } from '../item/item.service';
import {
  handleSpinMobileTokenProcess,
  preparePayloadForEStatementAnalysis,
} from './spinMobile.utils';
import axios from 'axios';
import { getReferenceFieldValue, preparePluginCredentials } from '../utils/utils';
import FormData from 'form-data';
import { cryptService } from '../middleware/encryption.middleware';
import { getProjectEncryption } from '../project/project.service';
import { createS3Client } from 'drapcode-utility';
import { privateUrl } from '../upload-api/fileUpload.service';

export const iprsKenyaService = async (
  db,
  projectId,
  enableAuditTrail,
  environment,
  user,
  tenant,
  subTenant,
  headers,
  collection,
  identifierField,
  itemId,
) => {
  try {
    const spinMobilePlugin = await findInstalledPlugin(projectId, pluginCode.SPIN_MOBILE);
    if (!spinMobilePlugin) return pluginNotInstalledMessage('Spin Mobile');
    const processedCredentials = preparePluginCredentials(
      spinMobilePlugin.setting,
      environment,
      tenant,
    );
    const iprsKenyaPlugin = await findInstalledPlugin(projectId, pluginCode.IPRS_KENYA);
    if (!iprsKenyaPlugin) return pluginNotInstalledMessage('IPRS - Kenya');
    const { consumerKey, consumerSecret } = processedCredentials;
    const collectionDetails = await findOneCollectionService(projectId, collection);
    if (!collectionDetails) return collectionNotFoundMessage(collection);
    const itemResponse = await findItemById(db, projectId, collectionDetails, itemId, null);
    if (itemResponse.code !== 200) return itemResponse;
    itemResponse.data = await cryptService(
      itemResponse.data,
      projectId,
      collectionDetails,
      true,
      false,
      true,
    );
    const identifier = getReferenceFieldValue(itemResponse.data, identifierField);
    if (!identifier) {
      return { code: 400, message: 'No Id Number found on the specified identifier field' };
    }
    if (!/^\d{7,12}$/.test(identifier)) {
      return {
        code: 400,
        message: `Invalid Identifier: it must be a numeric value between 7 and 12 digits. Provided: ${identifier}`,
      };
    }
    const spinMobileTokenCollection = await findOneCollectionService(
      projectId,
      'spin_mobile_oauth_tokens',
    );
    if (!spinMobileTokenCollection) return collectionNotFoundMessage('Spin Mobile OAUTH Tokens');
    let { data: tokenItem } = await findItemById(db, projectId, spinMobileTokenCollection, null, {
      userId: { $in: [user?.uuid] },
    });
    const now = new Date();
    const isTokenExpired = tokenItem && new Date(tokenItem.expiry_date) <= now;
    if (!tokenItem?.access_token || isTokenExpired) {
      const tokenResponse = await handleSpinMobileTokenProcess(
        db,
        projectId,
        enableAuditTrail,
        user,
        tenant,
        headers,
        environment,
        consumerKey,
        consumerSecret,
        spinMobileTokenCollection,
        isTokenExpired ? tokenItem : null,
      );
      if (![200, 201].includes(tokenResponse.code)) return tokenResponse;
      tokenItem = tokenResponse.token;
    }
    const iprsUrl = 'https://api.spinmobile.co/api/analytics/account/iprs';
    let iprsResponse;
    try {
      iprsResponse = await axios.post(
        iprsUrl,
        { search_type: 'identity', identifier },
        {
          headers: { Authorization: `Bearer ${tokenItem.access_token}` },
          timeout: 55000,
        },
      );
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        return {
          code: 404,
          message: 'Customer data not found for the provided identifier.',
        };
      }
      return {
        code: error?.response?.status || 500,
        message: error?.response?.data?.message || 'IPRS service call failed',
        error: error.message || error,
        providerError: error?.response?.data || null,
      };
    }
    if (!iprsResponse?.data?.code?.startsWith('200')) {
      return {
        code: iprsResponse?.data?.code,
        message: iprsResponse?.data?.message || 'Error from IPRS service',
        data: iprsResponse?.data,
      };
    }
    const iprsKenyaDataCollection = await findOneCollectionService(projectId, 'iprs_kenya_data');
    if (!iprsKenyaDataCollection) return collectionNotFoundMessage('IPRS Kenya Data');
    const { data } = await saveItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      iprsKenyaDataCollection,
      {
        ...iprsResponse?.data?.response,
        rawResponse: iprsResponse?.data,
        userId: user?.uuid || '',
        tenantId: tenant?.uuid || '',
        subTenantId: subTenant?.uuid || '',
      },
    );
    return {
      code: iprsResponse.data.code,
      message: `IPRS Kenya data fetched successfully for identifier ${identifier}.`,
      spinMobileResponse: iprsResponse?.data,
      data,
    };
  } catch (error) {
    console.error('Error in iprsKenyaService:', error);
    return {
      code: error?.response?.status || 500,
      message: error?.response?.data?.message || 'An unexpected error occurred.',
      error: error?.message || error,
      providerError: error?.response?.data || null,
    };
  }
};

export const metropolCreditReportService = async (
  db,
  projectId,
  enableAuditTrail,
  environment,
  user,
  tenant,
  subTenant,
  headers,
  collection,
  identifierField,
  itemId,
  loanAmountField,
  reportType,
) => {
  try {
    const spinMobilePlugin = await findInstalledPlugin(projectId, pluginCode.SPIN_MOBILE);
    if (!spinMobilePlugin) return pluginNotInstalledMessage('Spin Mobile');
    const processedCredentials = preparePluginCredentials(
      spinMobilePlugin.setting,
      environment,
      tenant,
    );
    const metropolCreditPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.METROPOL_CREDIT_REPORTS_BUREAU_KENYA,
    );
    if (!metropolCreditPlugin) {
      return pluginNotInstalledMessage('Metropol Credit Reports Bureau - Kenya');
    }
    const { consumerKey, consumerSecret } = processedCredentials;
    const collectionDetails = await findOneCollectionService(projectId, collection);
    if (!collectionDetails) return collectionNotFoundMessage(collection);
    const itemResponse = await findItemById(db, projectId, collectionDetails, itemId, null);
    if (itemResponse.code !== 200) return itemResponse;
    itemResponse.data = await cryptService(
      itemResponse.data,
      projectId,
      collectionDetails,
      true,
      false,
      true,
    );
    const identifier = getReferenceFieldValue(itemResponse?.data, identifierField);
    if (!identifier) {
      return { code: 400, message: 'No Id Number found on the specified identifier field' };
    }
    if (!/^\d{7,12}$/.test(identifier)) {
      return {
        code: 400,
        message: `Invalid Identifier: it must be a numeric value between 7 and 12 digits. Provided: ${identifier}`,
      };
    }
    const loanAmount = getReferenceFieldValue(itemResponse?.data, loanAmountField);
    if (!loanAmount) {
      return { code: 400, message: 'No Loan Amount found on the specified loan amount field' };
    }
    if (!/^\d+$/.test(String(loanAmount))) {
      return { code: 400, message: `Loan Amount must be an integer. You provided: ${loanAmount}` };
    }
    const spinMobileTokenCollection = await findOneCollectionService(
      projectId,
      'spin_mobile_oauth_tokens',
    );
    if (!spinMobileTokenCollection) return collectionNotFoundMessage('Spin Mobile OAUTH Tokens');
    let { data: tokenItem } = await findItemById(db, projectId, spinMobileTokenCollection, null, {
      userId: { $in: [user?.uuid] },
    });
    const now = new Date();
    const isTokenExpired = tokenItem && new Date(tokenItem.expiry_date) <= now;
    if (!tokenItem?.access_token || isTokenExpired) {
      const tokenResponse = await handleSpinMobileTokenProcess(
        db,
        projectId,
        enableAuditTrail,
        user,
        tenant,
        headers,
        environment,
        consumerKey,
        consumerSecret,
        spinMobileTokenCollection,
        isTokenExpired ? tokenItem : null,
      );
      if (![200, 201].includes(tokenResponse.code)) return tokenResponse;
      tokenItem = tokenResponse.token;
    }
    const metropolUrl = 'https://api.spinmobile.co/api/analytics/account/metropol';
    const { data, status } = await axios.post(
      metropolUrl,
      {
        search_type: 'Metropol',
        identity_number: identifier,
        report_type: reportType,
        loan_amount: loanAmount,
      },
      { headers: { Authorization: `Bearer ${tokenItem.access_token}` } },
    );
    if (data?.data?.has_error) {
      return {
        code: 400,
        message:
          data?.data?.api_code_description ||
          'Error occurred while fetching Metropol Credit Report.',
        data: data?.data,
      };
    }
    if (data?.data?.api_code || data?.data?.api_code_description) {
      return {
        code: 404,
        message:
          data?.data?.api_code_description || 'No account information found for this identifier.',
        data: data?.data,
      };
    }
    const metropilCreditReportsCollection = await findOneCollectionService(
      projectId,
      'metropol_credit_reports',
    );
    if (!metropilCreditReportsCollection) {
      return collectionNotFoundMessage('Metropol Credit Reports');
    }
    const reportData = data?.data || {};
    const { account_info, association, ...creditReportPayload } = reportData;
    const saveItemResponse = await saveItem(
      db,
      projectId,
      environment,
      enableAuditTrail,
      metropilCreditReportsCollection,
      {
        ...creditReportPayload,
        rawResponse: data,
        userId: user?.uuid || '',
        tenantId: tenant?.uuid || '',
        subTenantId: subTenant?.uuid || '',
      },
    );
    if (saveItemResponse.code !== 201) return saveItemResponse;
    if (account_info && account_info.length) {
      const payload = account_info.map((account) => ({
        ...account,
        creditReport: saveItemResponse.data?.uuid,
        userId: user?.uuid || '',
        tenantId: tenant?.uuid || '',
        subTenantId: subTenant?.uuid || '',
      }));
      await saveBulkDataFromDeveloperAPI(
        db,
        projectId,
        environment,
        enableAuditTrail,
        'metropol_account_information',
        payload,
        'string',
        false,
      );
      if (association && association.length) {
        const payload = association.map((account) => ({
          ...account,
          creditReport: saveItemResponse.data?.uuid,
          userId: user?.uuid || '',
          tenantId: tenant?.uuid || '',
          subTenantId: subTenant?.uuid || '',
        }));
        await saveBulkDataFromDeveloperAPI(
          db,
          projectId,
          environment,
          enableAuditTrail,
          'metropol_associations',
          payload,
          'string',
          false,
        );
      }
    }
    return {
      code: status,
      message: `Metropol Credit Report fetched successfully for identifier ${identifier}.`,
      spinMobileResponse: data,
      data: saveItemResponse.data,
    };
  } catch (error) {
    console.error('Error in metropolCreditReportService:', error);
    return {
      code: error?.response?.status || 500,
      message: error?.response?.data?.message || 'An unexpected error occurred.',
      error: error?.message || error,
      providerError: error?.response?.data || null,
    };
  }
};

export const kraPinCheckerService = async (
  db,
  projectId,
  enableAuditTrail,
  environment,
  user,
  tenant,
  subTenant,
  headers,
  collection,
  identifierField,
  itemId,
) => {
  try {
    const spinMobilePlugin = await findInstalledPlugin(projectId, pluginCode.SPIN_MOBILE);
    if (!spinMobilePlugin) return pluginNotInstalledMessage('Spin Mobile');
    const processedCredentials = preparePluginCredentials(
      spinMobilePlugin.setting,
      environment,
      tenant,
    );
    const kraPinCheckerPlugin = await findInstalledPlugin(projectId, pluginCode.KRA_PIN_CHECKER);
    if (!kraPinCheckerPlugin) return pluginNotInstalledMessage('KRA PIN Checker');
    const { consumerKey, consumerSecret } = processedCredentials;
    const collectionDetails = await findOneCollectionService(projectId, collection);
    if (!collectionDetails) return collectionNotFoundMessage(collection);
    const itemResponse = await findItemById(db, projectId, collectionDetails, itemId, null);
    if (itemResponse.code !== 200) return itemResponse;
    itemResponse.data = await cryptService(
      itemResponse.data,
      projectId,
      collectionDetails,
      true,
      false,
      true,
    );
    const identifier = getReferenceFieldValue(itemResponse.data, identifierField);
    if (!identifier) {
      return { code: 400, message: 'No KRA PIN found on the specified identifier field' };
    }
    const spinMobileTokenCollection = await findOneCollectionService(
      projectId,
      'spin_mobile_oauth_tokens',
    );
    if (!spinMobileTokenCollection) return collectionNotFoundMessage('Spin Mobile OAUTH Tokens');
    let { data: tokenItem } = await findItemById(db, projectId, spinMobileTokenCollection, null, {
      userId: { $in: [user?.uuid] },
    });
    const now = new Date();
    const isTokenExpired = tokenItem && new Date(tokenItem.expiry_date) <= now;
    if (!tokenItem?.access_token || isTokenExpired) {
      const tokenResponse = await handleSpinMobileTokenProcess(
        db,
        projectId,
        enableAuditTrail,
        user,
        tenant,
        headers,
        environment,
        consumerKey,
        consumerSecret,
        spinMobileTokenCollection,
        isTokenExpired ? tokenItem : null,
      );
      if (![200, 201].includes(tokenResponse.code)) return tokenResponse;
      tokenItem = tokenResponse.token;
    }
    const kraPinCheckerUrl = 'https://api.spinmobile.co/api/analytics/account/krapincheck';
    const kraPinCheckerResponse = await axios.post(
      kraPinCheckerUrl,
      { search_type: 'pin', identifier },
      { headers: { Authorization: `Bearer ${tokenItem.access_token}` } },
    );
    if (kraPinCheckerResponse.data?.response_data?.ErrorCode) {
      return {
        code: 400,
        message:
          kraPinCheckerResponse.data?.response_data?.ErrorMessage ||
          'Error occurred while checking KRA PIN.',
        error: kraPinCheckerResponse.data,
      };
    } else {
      const kraPinChecksCollection = await findOneCollectionService(projectId, 'kra_pin_checks');
      if (!kraPinChecksCollection) return collectionNotFoundMessage('KRA PIN Checks');
      const { data } = await saveItem(
        db,
        projectId,
        environment,
        enableAuditTrail,
        kraPinChecksCollection,
        {
          ...kraPinCheckerResponse?.data?.response_data,
          rawResponse: kraPinCheckerResponse?.data,
          KRAPIN: kraPinCheckerResponse?.data?.response_data?.PINDATA?.KRAPIN || '',
          TypeOfTaxpayer: kraPinCheckerResponse?.data?.response_data?.PINDATA?.TypeOfTaxpayer || '',
          Name: kraPinCheckerResponse?.data?.response_data?.PINDATA?.Name || '',
          StatusOfPIN: kraPinCheckerResponse?.data?.response_data?.PINDATA?.StatusOfPIN || '',
          userId: user?.uuid || '',
          tenantId: tenant?.uuid || '',
          subTenantId: subTenant?.uuid || '',
        },
      );
      return {
        code: kraPinCheckerResponse.status,
        message: `KRA Pin Checked successfully for PIN ${identifier}.`,
        spinMobileResponse: kraPinCheckerResponse.data,
        data,
      };
    }
  } catch (error) {
    console.error('Error in kraPinCheckerService:', error);
    return {
      code: error?.response?.status || 500,
      message: error?.response?.data?.message || 'An unexpected error occurred.',
      error: error?.message || error,
      providerError: error?.response?.data || null,
    };
  }
};

export const eStatementAnalysisService = async (
  db,
  projectId,
  enableAuditTrail,
  environment,
  user,
  tenant,
  subTenant,
  headers,
  collection,
  statementField,
  statementType,
  bankCode,
  decrypterField,
  itemId,
) => {
  try {
    const spinMobilePlugin = await findInstalledPlugin(projectId, pluginCode.SPIN_MOBILE);
    if (!spinMobilePlugin) return pluginNotInstalledMessage('Spin Mobile');
    const processedSpinCredentials = preparePluginCredentials(
      spinMobilePlugin.setting,
      environment,
      tenant,
    );
    const { consumerKey, consumerSecret } = processedSpinCredentials;
    const eStatementAnalysisPlugin = await findInstalledPlugin(
      projectId,
      pluginCode.E_STATEMENT_ANALYSIS,
    );
    if (!eStatementAnalysisPlugin) {
      return pluginNotInstalledMessage('Spin Mobile : E-Statement Analysis');
    }
    const processedCredentials = preparePluginCredentials(
      eStatementAnalysisPlugin.setting,
      environment,
      tenant,
    );
    const { organizationCode } = processedCredentials;
    const collectionDetails = await findOneCollectionService(projectId, collection);
    if (!collectionDetails) return collectionNotFoundMessage(collection);
    const itemResponse = await findItemById(db, projectId, collectionDetails, itemId, null);
    if (itemResponse.code !== 200) return itemResponse;
    itemResponse.data = await cryptService(
      itemResponse.data,
      projectId,
      collectionDetails,
      true,
      false,
      true,
    );
    const statementFileObject = getReferenceFieldValue(itemResponse.data, statementField);
    const filesArray = Array.isArray(statementFileObject)
      ? statementFileObject
      : [statementFileObject];
    if (!statementFileObject || !filesArray || !filesArray.length) {
      return { code: 400, message: 'No File found on the specified statement field' };
    }
    const { key, isEncrypted, originalName, contentType } = filesArray[0];
    if (contentType !== 'application/pdf') {
      return {
        code: 400,
        message: 'Invalid file type. Only PDF files are supported for e-Statement Analysis.',
      };
    }
    const { encryption } = await getProjectEncryption(projectId);
    const { region, accessKeyId, secretAccessKey, bucket } = await loadS3PluginConfig(
      projectId,
      environment,
    );
    const awsConfig = { region, accessKey: accessKeyId, accessSecret: secretAccessKey };
    const s3Client = createS3Client(awsConfig);
    const fileBufferData = await privateUrl(key, isEncrypted, encryption, s3Client, bucket);
    const decrypter = getReferenceFieldValue(itemResponse.data, decrypterField);
    const spinMobileTokenCollection = await findOneCollectionService(
      projectId,
      'spin_mobile_oauth_tokens',
    );
    if (!spinMobileTokenCollection) return collectionNotFoundMessage('Spin Mobile OAUTH Tokens');
    let { data: tokenItem } = await findItemById(db, projectId, spinMobileTokenCollection, null, {
      userId: { $in: [user?.uuid] },
    });
    const now = new Date();
    const isTokenExpired = tokenItem && new Date(tokenItem.expiry_date) <= now;
    if (!tokenItem?.access_token || isTokenExpired) {
      const tokenResponse = await handleSpinMobileTokenProcess(
        db,
        projectId,
        enableAuditTrail,
        user,
        tenant,
        headers,
        environment,
        consumerKey,
        consumerSecret,
        spinMobileTokenCollection,
        isTokenExpired ? tokenItem : null,
      );
      if (![200, 201].includes(tokenResponse.code)) return tokenResponse;
      tokenItem = tokenResponse.token;
    }
    const eStatementUploadUrl = 'https://api.spinmobile.co/api/analytics/e-statement/upload/';
    const form = new FormData();
    form.append('document', fileBufferData, { filename: originalName });
    form.append('document_type', statementType);
    form.append('bank_code', bankCode || '');
    form.append('organization_code', organizationCode);
    form.append('sender', user?.email || 'Spin_LMS_API');
    form.append('decrypter', decrypter || '');
    form.append('remote_identifier', itemId);
    const eStatementUploadResponse = await axios.post(eStatementUploadUrl, form, {
      headers: {
        Authorization: `Bearer ${tokenItem.access_token}`,
        ...form.getHeaders(),
      },
    });
    if (eStatementUploadResponse.data?.document_id) {
      const analysisUrl = 'https://api.spinmobile.co/api/analytics/analysis-query/';
      let analysisResponse;
      try {
        analysisResponse = await axios.post(
          analysisUrl,
          {
            score_type: statementType,
            unique_id: eStatementUploadResponse.data.document_id,
          },
          { headers: { Authorization: `Bearer ${tokenItem.access_token}` } },
        );
        if (analysisResponse?.data?.code) {
          return {
            code: 400,
            message:
              analysisResponse.data.message + '. Invalid/Unsupported PDF.' ||
              'Error from SpinMobile Analysis API',
            spinMobileResponse: analysisResponse.data,
          };
        }
      } catch (analysisError) {
        console.error('SpinMobile Analysis API failed', analysisError);
        return {
          code: analysisError?.response?.status || 500,
          message: 'SpinMobile analysis failed',
          providerError: analysisError?.response?.data || null,
          error: analysisError?.message,
        };
      }
      const eStatementAnalysisCollection = await findOneCollectionService(
        projectId,
        'e_statement_analysis',
      );
      if (!eStatementAnalysisCollection) return collectionNotFoundMessage('E-Statement Analysis');
      const payload = preparePayloadForEStatementAnalysis(
        analysisResponse?.data,
        user,
        tenant,
        subTenant,
      );
      const { data } = await saveItem(
        db,
        projectId,
        environment,
        enableAuditTrail,
        eStatementAnalysisCollection,
        payload,
      );
      return {
        code: analysisResponse.status,
        message: 'E-Statement analysis done successfully.',
        spinMobileResponse: analysisResponse.data,
        data,
      };
    }
  } catch (error) {
    console.error('Error in eStatementAnalysisService:', error);
    return {
      code: error?.response?.status || 500,
      message: error?.response?.data?.message || 'An unexpected error occurred.',
      error: error?.message || error,
      providerError: error?.response?.data || null,
    };
  }
};
