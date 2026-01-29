import { AppError, loadLocalizations } from 'drapcode-utility';
import { findItemById, updateItemById } from '../item/item.service';
import {
  addDynamicDataIntoElement,
  cleanForPuppeteer,
  convertHtmlToPdf,
  generatePDFNameFromCollection,
} from '../utils/appUtils';
import { findSnippet } from './snippet.service';
import { addLocalizationDataIntoElements } from '../project/build-utils';
import { findOneCollectionService, userCollectionService } from '../collection/collection.service';
import { cryptService } from '../middleware/encryption.middleware';

import axios from 'axios';
import FormData from 'form-data';
import { findTemplate } from '../email-template/template.service';
import { replaceFieldsIntoTemplate } from '../email/email.service';
import { localizationFromRedis, snippetFromRedis } from 'drapcode-redis';
import { UPLOAD_ROUTE } from '../routes/constants';

export const showTemplateContent = async (req, res, next) => {
  try {
    const { projectId, query, params } = req;
    const { lang } = query;
    const { templateId } = params;
    const redisResult = await snippetFromRedis(projectId);
    let snippet = null;
    if (Array.isArray(redisResult) && redisResult.length > 0) {
      snippet = redisResult.find((item) => item.uuid === templateId);
    }
    if (!snippet) {
      snippet = await findSnippet(projectId, templateId);
    }
    delete snippet.content['nocode-assets'];
    snippet.content = await replaceLocalizationContent(projectId, lang, snippet.content);
    return res.status(200).send(snippet.content);
  } catch (e) {
    console.error('show template content ~ error:', e);
    next(e);
  }
};
// TODO: can be refactor or removed
export const findSnippetById = async (req, res, next) => {
  try {
    const { projectId, query, params } = req;
    const { lang } = query;
    const { templateId } = params;
    const response = await getSnippet(projectId, lang, templateId);
    res.status(200).send(response);
  } catch (e) {
    console.error('find template by uuid ~ error:', e);
    next(e);
  }
};

export const findModalTemplate = async (req, res, next) => {
  try {
    const { projectId, query, params } = req;
    const { lang } = query;
    const { templateId } = params;
    const response = await getSnippet(projectId, lang, templateId);
    res.status(200).send(response);
  } catch (e) {
    console.error('find modal template ~ error:', e);
    next(e);
  }
};

const getDynamicPDFContentHtml = async (config, cleanHTML = false, style = '') => {
  const {
    db,
    projectId,
    lang,
    collectionName,
    itemId,
    item,
    headers,
    project,
    dateFormat,
    tenant,
    user,
    environment,
    format,
    subTenant,
  } = config;
  let { pdfContent } = config;
  pdfContent = await replaceLocalizationContent(projectId, lang, pdfContent);
  let scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;

  let pdfContentHtml = pdfContent['nocode-html']
    ? pdfContent['nocode-html'].replace(scriptRegex, '')
    : '';
  let pdfContentCss = pdfContent['nocode-css'] ? pdfContent['nocode-css'] : '';
  pdfContentHtml = await addDynamicDataIntoElement(
    pdfContentHtml,
    pdfContentCss,
    collectionName,
    itemId,
    item.data,
    db,
    headers,
    projectId,
    project.timezone,
    dateFormat,
    tenant,
    user,
    environment,
    format,
    subTenant,
  );
  if (cleanHTML) {
    pdfContentHtml = await cleanForPuppeteer(pdfContentHtml);
    pdfContentHtml = `
    <style>
    ${style}
    ${pdfContentCss}
    </style>
    ${pdfContentHtml}
    `;
  }
  return pdfContentHtml;
};

export const downloadPDFTemplateContent = async (req, res, next) => {
  try {
    const {
      db,
      params,
      headers,
      query,
      projectId,
      project,
      tenant,
      body,
      user,
      environment,
      enableAuditTrail,
      subTenant,
      dateFormat,
    } = req;
    const { lang } = query;
    const { templateId } = params;
    const {
      collectionName,
      itemId,
      pdfDownloadOptions,
      saveToCollection = false,
      collection: collectionToSave,
      collectionField,
    } = body;
    const {
      format,
      displayHeader,
      displayFooter,
      headerTemplate,
      footerTemplate,
      generatePDFName,
      pdfNameField,
    } = pdfDownloadOptions;
    const pdfSnippet = await findSnippet(projectId, templateId);
    let item = { data: null };
    let pdfCollection = '';
    let pdfContent = pdfSnippet.content;
    const pdfCollectionName = pdfSnippet.collectionId;
    const pdfTemplateName = pdfSnippet.name;
    let pdfStyle = pdfSnippet.customStyle;
    const pdfContentCss = pdfContent['nocode-css'] ? pdfContent['nocode-css'] : '';
    pdfStyle = `
    ${pdfStyle}
    ${pdfContentCss}
    `;
    if (pdfCollectionName && collectionName) {
      if (pdfCollectionName === collectionName) {
        //Get Collection
        pdfCollection = await findOneCollectionService(projectId, collectionName);
        // Get Item data
        item = await findItemById(db, projectId, pdfCollection, itemId, null);
        // Decrypt data
        let decryptedResponse;
        if (item.data) {
          decryptedResponse = await cryptService(
            item.data,
            projectId,
            pdfCollection,
            true,
            false,
            true,
          );
        }
        if (decryptedResponse) {
          if (decryptedResponse.status === 'FAILED') {
            res.status(400).send({ message: decryptedResponse.message });
          } else item.data = decryptedResponse;
        }
      } else {
        const error = new AppError('Collection is not similar to Template Collection');
        res.status(400).send(error);
      }
    }
    const pdfContentConfig = {
      db,
      projectId,
      lang,
      collectionName,
      itemId,
      item,
      headers,
      project,
      dateFormat,
      tenant,
      user,
      environment,
      format,
      subTenant,
      pdfContent,
    };
    const pdfContentHtml = await getDynamicPDFContentHtml(pdfContentConfig, false);
    let headerContentHtml = '';
    let footerContentHtml = '';
    let headerStyle = '';
    let footerStyle = '';
    let displayHeaderFooter = displayHeader || displayFooter;
    displayHeaderFooter = !!displayHeaderFooter;
    if (displayHeaderFooter) {
      if (displayHeader) {
        // Header HTML
        const headerSnippet = await findSnippet(projectId, headerTemplate);
        const headerContent = headerSnippet.content;
        headerStyle = headerSnippet.customStyle;
        const headerConfig = { ...pdfContentConfig, pdfContent: headerContent };
        headerContentHtml = await getDynamicPDFContentHtml(headerConfig, true, headerStyle);
      } else headerContentHtml = "<div style='font-size:0; color:transparent;'></div>";
      if (displayFooter) {
        // Footer HTML
        const footerSnippet = await findSnippet(projectId, footerTemplate);
        const footerContent = footerSnippet.content;
        footerStyle = footerSnippet.customStyle;
        const footerConfig = { ...pdfContentConfig, pdfContent: footerContent };
        footerContentHtml = await getDynamicPDFContentHtml(footerConfig, true, footerStyle);
      } else footerContentHtml = `"<div style='font-size:0; color:transparent;'></div>"`;
    }
    const host = req.get('host');
    const pdfName = generatePDFNameFromCollection({
      generatePDFName,
      pdfNameField,
      collection: pdfCollection,
      itemData: item.data,
      pdfTemplateName,
    });
    const pdfObj = {
      host,
      pdfContent: pdfContentHtml,
      pdfDownloadOptions,
      saveToCollection,
      collectionToSave,
      collectionField,
      itemId,
      pdfStyle,
      displayHeaderFooter,
      headerHTML: headerContentHtml,
      footerHTML: footerContentHtml,
      generatePDFName,
      pdfNameField,
      pdfName,
    };
    await pdfFromSnippet(db, projectId, environment, enableAuditTrail, pdfObj, res);
  } catch (e) {
    console.error('downloadPDFTemplateContent ~ error:', e);
    next(e);
  }
};

export const downloadAgreementTemplateContent = async (req, res, next) => {
  try {
    const { db, params, projectId, body, user, environment, enableAuditTrail } = req;
    const { templateId } = params;
    const {
      collectionName,
      itemId,
      pdfDownloadOptions,
      saveToCollection = false,
      collection: collectionToSave,
      collectionField,
    } = body;
    const pdfTemplate = await findTemplate(projectId, templateId);
    let item = { data: null };
    let pdfContent = pdfTemplate.content;
    const pdfCollectionName = pdfTemplate.collectionId;
    const pdfTemplateName = pdfTemplate.name;
    const pdfStyle = pdfTemplate.customStyle;
    if (pdfCollectionName && collectionName) {
      if (pdfCollectionName === collectionName) {
        //Get Collection
        const collection = await findOneCollectionService(projectId, collectionName);
        // Get Item data
        item = await findItemById(db, projectId, collection, itemId, null);
        // Decrypt data
        let decryptedResponse;
        if (item.data) {
          decryptedResponse = await cryptService(
            item.data,
            projectId,
            collection,
            true,
            false,
            true,
          );
        }
        if (decryptedResponse) {
          if (decryptedResponse.status === 'FAILED') {
            res.status(400).send({ message: decryptedResponse.message });
          } else item.data = decryptedResponse;
        }
      } else {
        const error = new AppError('Collection is not similar to Template Collection');
        res.status(400).send(error);
      }
    }

    const templateCollection = await findOneCollectionService(projectId, pdfTemplate.collectionId);
    const userCollection = await userCollectionService(projectId);
    pdfContent = replaceFieldsIntoTemplate(
      pdfContent,
      item.data,
      user,
      environment,
      templateCollection,
      userCollection,
      {},
    );
    const host = req.get('host');
    const pdfObj = {
      host,
      pdfTemplateName,
      pdfContent,
      pdfDownloadOptions,
      saveToCollection,
      collectionToSave,
      collectionField,
      itemId,
      collectionName,
      pdfStyle,
    };
    await pdfFromSnippet(db, projectId, environment, enableAuditTrail, pdfObj, res);
  } catch (e) {
    console.error('downloadPDFTemplateContent ~ error:', e);
    next(e);
  }
};

export const pdfFromSnippet = async (db, projectId, environment, enableAuditTrail, pdfObj, res) => {
  let {
    host,
    pdfContent,
    pdfDownloadOptions,
    saveToCollection,
    collectionToSave,
    collectionField,
    itemId,
    pdfStyle,
    displayHeaderFooter,
    headerHTML,
    footerHTML,
    pdfName,
  } = pdfObj;
  const { marginTop, marginBottom, marginLeft, marginRight, printBackground, format, landscape } =
    pdfDownloadOptions;

  let margin = {};
  if (marginTop) margin.top = `${marginTop}cm`;
  if (marginBottom) margin.bottom = `${marginBottom}cm`;
  if (marginLeft) margin.left = `${marginLeft}cm`;
  if (marginRight) margin.right = `${marginRight}cm`;
  const pdfOptions = {
    printBackground: printBackground || false,
    preferCSSPageSize: true,
    format: format ? format : 'A4',
    margin,
    landscape: !!landscape,
    displayHeaderFooter,
    headerTemplate: headerHTML,
    footerTemplate: footerHTML,
  };
  const pdfBuffer = await convertHtmlToPdf(pdfContent, pdfOptions, projectId, pdfStyle);
  if (saveToCollection) {
    const uploadResponse = await savePDFToCollection(
      db,
      projectId,
      environment,
      enableAuditTrail,
      pdfBuffer,
      collectionToSave,
      collectionField,
      itemId,
      host,
    );
    if (uploadResponse.code === 201 || uploadResponse.code === 200) {
      res.status(200).send({
        message: 'PDF saved to collection successfully',
        data: uploadResponse,
        status: 200,
      });
    } else {
      res
        .status(500)
        .send({ message: 'Failed to save PDF to collection', error: uploadResponse.error });
    }
  } else {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfName}"`);
    res.status(200).send(pdfBuffer);
  }
};

const savePDFToCollection = async (
  db,
  projectId,
  environment,
  enableAuditTrail,
  pdfBuffer,
  collectionName,
  collectionField,
  itemId,
  host,
) => {
  try {
    const formData = new FormData();
    const fileName = `${collectionName}_${itemId}.pdf`;
    const file = Buffer.from(pdfBuffer);
    formData.append('file', file, {
      filename: fileName,
      contentType: 'application/pdf',
    });
    const endpoint = `https://${host}${UPLOAD_ROUTE}/upload/${collectionName}/${collectionField}`;
    const requestHeaders = {
      ...formData.getHeaders(),
    };
    const response = await axios.post(endpoint, formData, {
      headers: requestHeaders,
    });
    if (response.data) {
      const itemData = { [collectionField]: response.data };
      const collectionData = await findOneCollectionService(projectId, collectionName);
      if (collectionData) {
        const addItem = await updateItemById(
          db,
          projectId,
          environment,
          enableAuditTrail,
          collectionData,
          itemId,
          itemData,
        );
        return addItem;
      }
    }
  } catch (error) {
    console.error('savePDFToCollection ~ error:', error);
    return { status: 'failure', error: error.message };
  }
};

const replaceLocalizationContent = async (projectId, lang, content) => {
  const localizations = await fetchLocalization(projectId);
  const localization =
    lang && !['null', 'undefined'].includes(lang)
      ? localizations.find((local) => local.language === lang)
      : localizations.find((local) => local.isDefault);
  content['nocode-html'] = addLocalizationDataIntoElements(content['nocode-html'], localization);
  return content;
};

const fetchLocalization = async (projectId) => {
  const redisResult = await localizationFromRedis(projectId);
  if (Array.isArray(redisResult) && redisResult.length > 0) {
    console.log(`*** Found in redis! Returning localizations for project: ${projectId}`);
    return redisResult;
  } else {
    return loadLocalizations(projectId);
  }
};

const getSnippet = async (projectId, lang, templateId) => {
  const redisResult = await snippetFromRedis(projectId);
  let redisSnippetTemplate = null;
  if (Array.isArray(redisResult) && redisResult.length > 0) {
    redisSnippetTemplate = redisResult.find((item) => item.uuid === templateId);
  }
  if (!redisSnippetTemplate) {
    redisSnippetTemplate = await findSnippet(projectId, templateId);
  }
  if (redisSnippetTemplate && redisSnippetTemplate.content) {
    console.log(`*** Found in redis! Returning snippet template: ${templateId}`);
    redisSnippetTemplate.content = await replaceLocalizationContent(
      projectId,
      lang,
      redisSnippetTemplate.content,
    );
    return redisSnippetTemplate;
  }
  return redisSnippetTemplate;
};
