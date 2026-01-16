import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createOrUpdatePlaidSettingOfUser } from './plaid.service';
import { replaceValueFromSource } from 'drapcode-utility';
import { logger } from 'drapcode-logger';
import { getPlaidExtension } from '../install-plugin/installedPlugin.service';
export const createLinkToken = async (req, res, next) => {
  const { projectId, user, tenant, environment: pEnvironment } = req;
  if (!user) {
    return res.status(401).send({ code: 403, message: 'Invalid token.' });
  }
  try {
    const plaidSetting = await getPlaidExtension(projectId);
    let {
      app_name,
      client_id,
      client_secret,
      environment,
      products,
      country_codes,
      language,
      webhook,
    } = plaidSetting.setting;

    app_name = replaceValueFromSource(app_name, pEnvironment, null);
    client_id = replaceValueFromSource(client_id, pEnvironment, null);
    client_secret = replaceValueFromSource(client_secret, pEnvironment, null);
    environment = replaceValueFromSource(environment, pEnvironment, null);
    webhook = replaceValueFromSource(webhook, pEnvironment, null);

    if (!products || products.length === 0) {
      products = ['transactions'];
    }
    if (!country_codes || country_codes.length === 0) {
      country_codes = ['US', 'CA'];
    }
    let env = '';
    if (environment === 'sandbox') {
      env = PlaidEnvironments.sandbox;
    } else if (environment === 'production') {
      env = PlaidEnvironments.production;
    } else {
      env = PlaidEnvironments.development;
    }
    const configuration = new Configuration({
      basePath: env,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': client_id,
          'PLAID-SECRET': client_secret,
          'Plaid-Version': '2020-09-14',
        },
      },
    });
    const client = new PlaidApi(configuration);
    const configs = {
      user: {
        client_user_id: tenant ? tenant.uuid : user.uuid,
      },
      client_name: app_name,
      products,
      country_codes,
      language: language || 'en',
    };
    if (webhook) {
      configs.webhook = webhook;
    }
    const createTokenResponse = await client.linkTokenCreate(configs);
    res.json(createTokenResponse.data);
  } catch (error) {
    next(error);
  }
};

export const setAccessToken = async (req, res, next) => {
  const { projectId, db, body, user, tenant, environment: pEnvironment, enableAuditTrail } = req;
  if (!user) {
    return res.status(401).send({ code: 403, message: 'Invalid token.' });
  }
  try {
    const { public_token } = body;
    const plaidSetting = await getPlaidExtension(projectId);
    let { client_id, client_secret, environment } = plaidSetting.setting;

    client_id = replaceValueFromSource(client_id, pEnvironment, null);
    client_secret = replaceValueFromSource(client_secret, pEnvironment, null);
    environment = replaceValueFromSource(environment, pEnvironment, null);

    let env = '';
    if (environment === 'sandbox') {
      env = PlaidEnvironments.sandbox;
    } else if (environment === 'production') {
      env = PlaidEnvironments.production;
    } else {
      env = PlaidEnvironments.development;
    }

    const configuration = new Configuration({
      basePath: env,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': client_id,
          'PLAID-SECRET': client_secret,
          'Plaid-Version': '2020-09-14',
        },
      },
    });
    const client = new PlaidApi(configuration);
    const plaidPublicTokenResponse = await client.itemPublicTokenExchange({ public_token });
    const accessToken = plaidPublicTokenResponse.data.access_token;
    const itemId = plaidPublicTokenResponse.data.item_id;
    logger.info(`accessToken: ${accessToken} <==> itemId: ${itemId}`);
    let assetReportToken = '';
    let assetReportId = '';
    try {
      const plaidAssetReportTokenResponse = await client.assetReportCreate({
        access_tokens: [accessToken],
        days_requested: 60,
        options: {},
      });

      assetReportToken = plaidAssetReportTokenResponse.data.asset_report_token;
      assetReportId = plaidAssetReportTokenResponse.data.asset_report_id;
      logger.info(`assetReportToken: ${assetReportToken} <==> assetReportId: ${assetReportId}`);
    } catch (error) {
      console.error('error', error);
    }

    const response = await createOrUpdatePlaidSettingOfUser(
      db,
      projectId,
      environment,
      enableAuditTrail,
      user,
      tenant,
      accessToken,
      itemId,
      assetReportToken,
      assetReportId,
    );
    if (response.success) {
      res.json({ success: true, message: 'Plaid token has been updated' }).status(200);
    } else {
      res.status(400).json({ success: false, message: response.message });
    }
    return;
  } catch (error) {
    next(error);
  }
};
