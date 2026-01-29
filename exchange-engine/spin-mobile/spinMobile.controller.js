import {
  eStatementAnalysisService,
  iprsKenyaService,
  kraPinCheckerService,
  metropolCreditReportService,
} from './spinMobile.service';

export const iprsKenya = async (req, res, next) => {
  try {
    const { db, projectId, enableAuditTrail, environment, body, user, tenant, subTenant, headers } =
      req;
    const { collection, identifierField, itemId } = body;
    const iprsResponse = await iprsKenyaService(
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
    );
    return res.status(iprsResponse.code).send(iprsResponse);
  } catch (error) {
    console.error('Error in iprsKenya:', error);
    next(error);
  }
};

export const metropolCreditReport = async (req, res, next) => {
  try {
    const { db, projectId, enableAuditTrail, environment, body, user, tenant, subTenant, headers } =
      req;
    const { collection, identifierField, itemId, loanAmountField, reportType } = body;
    const metropolResponse = await metropolCreditReportService(
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
    );
    return res.status(metropolResponse.code).send(metropolResponse);
  } catch (error) {
    console.error('Error in metropolCreditReport:', error);
    next(error);
  }
};

export const kraPinChecker = async (req, res, next) => {
  try {
    const { db, projectId, enableAuditTrail, environment, body, user, tenant, subTenant, headers } =
      req;
    const { collection, identifierField, itemId } = body;
    const kraPinCheckerResponse = await kraPinCheckerService(
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
    );
    return res.status(kraPinCheckerResponse.code).send(kraPinCheckerResponse);
  } catch (error) {
    console.error('Error in kraPinChecker:', error);
    next(error);
  }
};

export const eStatementAnalysis = async (req, res, next) => {
  try {
    const { db, projectId, enableAuditTrail, environment, body, user, tenant, subTenant, headers } =
      req;
    const { collection, statementField, statementType, bankCode, decrypterField, itemId } = body;
    const eStatementAnalysisResponse = await eStatementAnalysisService(
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
    );
    return res.status(eStatementAnalysisResponse.code).send(eStatementAnalysisResponse);
  } catch (error) {
    console.error('Error in eStatementAnalysis:', error);
    next(error);
  }
};
