import { populateProjectSettingOnRequest } from '../project/project.service';
import { logger } from 'drapcode-logger';
import { serverDomains, uatEnvs } from './constants';
import { extractEnvironment } from './envUtil';
import { findProjectFromFile } from 'drapcode-utility';
import { createMongoConnection } from './mongoUtil';

let ITEM_DB_HOST = process.env.ITEM_DB_HOST;
let ITEM_DB_USERNAME = process.env.ITEM_DB_USERNAME;
let ITEM_DB_PASSWORD = process.env.ITEM_DB_PASSWORD;
let PROJECT_HOSTNAME = process.env.PROJECT_HOSTNAME;
let APP_ENV = process.env.APP_ENV;
const EXCHANGE_DOMAIN = process.env.EXCHANGE_DOMAIN;

ITEM_DB_HOST = ITEM_DB_HOST || 'localhost';
ITEM_DB_USERNAME = ITEM_DB_USERNAME || '';
ITEM_DB_PASSWORD = ITEM_DB_PASSWORD || '';

const dbConnection = async (req, res, next) => {
  const { subdomains, headers, originalUrl, hostname } = req;
  console.log('subdomains :>> ', subdomains);
  console.log('hostname :>> ', hostname);
  let { origin, referer, projectid } = headers;
  const condition =
    originalUrl.includes('/api/v1/projects/build') ||
    originalUrl.includes('/api/v1/code-export/process') ||
    originalUrl.includes('/auth/callback');

  if (condition) {
    if (!projectid) {
      return res.status(400).json({ message: 'Not a valid project. Please contact Admin' });
    }

    return next();
  }

  if (originalUrl === '/favicon.ico') {
    return res.end();
  }

  let query = {};
  let environment = subdomains[0];
  if (!uatEnvs.includes(environment)) {
    environment = '';
  }
  if (hostname.includes(EXCHANGE_DOMAIN)) {
    const ignoredSubdomains = ['api', ...serverDomains];

    const projectSeoName = subdomains.filter((s) => !ignoredSubdomains.includes(s)).pop();
    if (!projectSeoName || projectSeoName.toLowerCase() === 'undefined') {
      return res.status(400).send('Please use subdomain');
    }

    if (origin) {
      origin = origin.replace(/^https?:\/\//, '').split(':')[0];
      query.or = [{ seoName: projectSeoName }, { domainName: origin }];
    } else {
      query = { seoName: projectSeoName };
    }
  } else {
    query = { domainName: hostname };
  }

  let project = findProjectFromFile(query);
  if (!project) {
    return res.status(404).send('This url does not exist. Please publish again.');
  }
  req.db = null;
  const pDatabase = `project_${project.uuid}`;
  try {
    const connection = await createMongoConnection({
      host: ITEM_DB_HOST,
      database: pDatabase,
      username: ITEM_DB_USERNAME,
      password: ITEM_DB_PASSWORD,
    });

    req.db = connection;

    let currentEnvironment = extractEnvironment(project.environments, APP_ENV);
    req.environment = currentEnvironment;
    req.urlEnv = environment; //This used in surface when it was separate

    project = populateProjectSettingOnRequest(req, project, APP_ENV);
    req.project = project;

    return next();
  } catch (error) {
    if (req.db) {
      req.db.close();
    }
    logger.error(`Failed to Connect Project Database: ${error}`);
    return res.status(500).send('Database connection error.');
  }
};

export default dbConnection;
