import { logger } from 'drapcode-logger';
import { checkIpAddresses, findOneDevApisService } from '../../developer/dev.service';

//TODO: Check
const verifyDevToken = async (req, res, next) => {
  try {
    let { environment, headers, project, url, method, projectId, skipDeveloperChecks } = req;
    console.log('🚀 ~ verifyDevToken ~ environment:', environment);
    console.log('skipDeveloperChecks :>> ', skipDeveloperChecks);
    // const { isProdEnable, refKey } = environment;

    const labelPrint = 'DEVELOPER API::';
    if (skipDeveloperChecks) return next();

    const apiNotEnableObj = {
      errStatus: 401,
      message: 'Developer API is not Enabled.',
      status: 'FAILED',
    };

    if (!environment) {
      return res.status(401).json({
        errStatus: 404,
        message: 'Environment does not exist in this Project',
        status: 'FAILED',
      });
    }
    const label = { label: project.projectName };
    logger.info(`${labelPrint} projectEnvs => ${JSON.stringify(environment)}`, label);

    //Check for IP address
    // console.log('This is the req object ', req);
    const { key, ipAddresses } = environment;
    logger.info(`${labelPrint} key => ${key}`, label);
    logger.info(`${labelPrint} ipAddresses => ${ipAddresses}`, label);
    console.log('These are the req headers: ', headers);
    console.log('These are the x-forwarded-for headers : ', headers['x-forwarded-for']);
    console.log('These are the req connectoin headers: ', req.connection.remoteAddress);
    let clientIp = headers['x-forwarded-for'] || req.connection.remoteAddress;
    // clientIp = normalizeIp(clientIp);
    logger.info(`Client IP: ${clientIp}`, label);
    console.log('This is the client ip address: ', clientIp);

    let isValidIp = checkIpAddresses(clientIp, ipAddresses);
    if (!isValidIp) {
      logger.info(
        `${labelPrint} IP address is not allowed:: ${clientIp} isValidIp:: ${isValidIp}`,
        label,
      );
      return res.status(403).json({
        errStatus: 403,
        message: 'Unauthorized, Request from this IP is not allowed.',
        status: 'FAILED',
      });
    }
    console.log('***** Checking URL restrictions *****');

    const baseURL = url.split('?')[0];
    console.log('baseURL', baseURL);
    const devApiEnable = await findOneDevApisService({
      projectId,
      url: baseURL,
      method,
    });

    console.log('devApiEnable', devApiEnable);
    if (!devApiEnable) {
      return res.status(401).json(apiNotEnableObj);
    }
    const { enable, auth, isEncrypted, userAuthenticate, roles, permissions } = devApiEnable;

    const reqKey = headers['x-api-key'];
    console.log('********** **********');
    console.log('********** **********');

    logger.info(`${labelPrint} connectorApiKey => ${project.connectorApiKey}`, label);
    logger.info(`${labelPrint} reqKey => ${reqKey}`, label);
    console.log('********** **********');
    console.log('********** **********');

    /**
     * This condition is used to bypass request from data-sync app
     */
    if (project.connectorApiKey && reqKey && project.connectorApiKey === reqKey) {
      req.decrypt = isEncrypted;
      console.log('******req.decrypt***', req.decrypt);
      return next();
    }

    if (!enable) {
      logger.info(`${labelPrint} API is not enable`);
      return res.status(401).json(apiNotEnableObj);
    }

    if (auth) {
      if (!key) {
        logger.error(`${labelPrint} No Key generated for this API`, label);
        return res.status(401).json({
          errStatus: 401,
          message: 'No key generated for this API',
          status: 'FAILED',
        });
      }

      if (!reqKey) {
        logger.error(`${labelPrint} No keys provided`, label);
        return res.status(401).json({
          errStatus: 401,
          message: 'Authentication key is missing',
          status: 'FAILED',
        });
      }

      if (key !== reqKey) {
        logger.error(`${labelPrint} Provided key is not valid`, label);
        return res.status(403).json({
          errStatus: 403,
          message: 'Unauthorized, authorization key is not valid',
          status: 'FAILED',
        });
      }
    }
    req.decrypt = isEncrypted;
    req.devUserAuthenticate = userAuthenticate;
    req.devUserRoles = roles;
    req.devUserPermissions = permissions;
    console.log('******req.decrypt***', req.decrypt);
    return next();
  } catch (error) {
    logger.error(error);
    const { errStatus, status, message } = error;
    return res.status(errStatus ? errStatus : 400).json({
      error: error,
      status: status ? status : 'ERROR',
      message: message ? message : '',
    });
  }
};

export default verifyDevToken;
