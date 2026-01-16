import {
  drapcodeEncryptDecrypt,
  processKey,
  removeProjectFromFile,
  saveProjectToFile,
  clearProjectSubfolder,
  saveProjectPages,
  saveWebhooks,
  saveExternalApis,
  saveCustomComponents,
  saveCustomMappings,
  saveTasks,
  saveEvents,
  saveSnippets,
  saveLocalizations,
  savePlugins,
  saveDevAPIs,
  saveTemplates,
  saveCollections,
  findProjectFromFile,
  saveExternalDbs,
  clearProjectFilesInSubfolder,
} from 'drapcode-utility';
import { logger } from 'drapcode-logger';
import { v4 as uuidv4 } from 'uuid';
import {
  projectFromRedis,
  clearProjectFromRedis,
  updateProjectInRedis,
  clearEventInRedis,
  updateEventInRedis,
  clearExternalAPIInRedis,
  updateExternalAPIInRedis,
  clearCustomComponentInRedis,
  updateCustomComponentInRedis,
  clearCustomMappingInRedis,
  updateCustomMappingInRedis,
  clearPluginInRedis,
  updatePluginInRedis,
  clearTemplateInRedis,
  updateTemplateInRedis,
  clearSnippetInRedis,
  updateSnippetInRedis,
  clearLocalizationInRedis,
  updateLocalizationInRedis,
  clearCollectionInRedis,
  updateCollectionInRedis,
  updateExternalDBInRedis,
} from 'drapcode-redis';
import {
  loadCollectionsFromBuilder,
  loadEventsFromBuilder,
  loadExternalApisFromBuilder,
  loadPagesFromBuilder,
  loadPluginsFromBuilder,
  loadProjectFromBuilder,
  loadTemplatesFromBuilder,
  makePostApiCall,
  loadWebhooksFromBuilder,
  loadSnippetsFromBuilder,
  loadLocalizationFromBuilder,
  loadCustomComponentsFromBuilder,
  loadCustomDataMappingFromBuilder,
  loadTasksScheduleFromBuilder,
  loadDevapisFromBuilder,
  loadExternalDbsFromBuilder,
} from './builder-api';
import { createProfilerService, updateProfilerService } from '../profiling/profiler.service';
import { API } from '../utils/enums/ProfilerType';
const BUILDER_ENGINE = process.env.BUILDER_ENGINE;

export const findProjectByQuery = async (projectId) => {
  let redisProject = null;
  if (projectId) {
    redisProject = await projectFromRedis(projectId);
  }
  if (redisProject) {
    return redisProject;
  }
  const query = { uuid: projectId };
  let project = findProjectFromFile(query);

  if (project) {
    console.log(`*** Found in Exchange DB! Returning project: ${projectId}`);
    await updateProjectInRedis(project.uuid, project);
    await updateProjectInRedis(project.seoName, project);
    return project;
  }
  logger.info(`query findProjectByQuery :>>  ${projectId}`);
  console.log('***************');
  console.log('Loading project detail from Builder');
  console.log('***************');
  let projectUrl = `${BUILDER_ENGINE}projects/core/query/exchange`;
  const response = await makePostApiCall(projectUrl, query);
  if (response) {
    await processSaveProject(response, '');
  }
  return response;
};

export const loadProjectDetail = async (projectId, version, subscription) => {
  clearProjectSubfolder(projectId, 'projects');
  await clearProjectFromRedis(projectId);
  let projectDetail = await loadProjectFromBuilder(projectId, version);
  if (!projectDetail) {
    return null;
  }
  await processSaveProject(projectDetail, subscription);
  return projectDetail;
};

const processSaveProject = async (projectDetail, subscription) => {
  console.log('Process KMS Decryption');
  projectDetail = await processKMSDecryptionAll(projectDetail);
  let projectType = '';
  if (['FREE', 'BUILDER_FREE'].includes(subscription)) {
    projectType = 'FREE';
  }
  projectDetail.projectType = projectType;
  console.log('Save project in Configuration Database');
  console.log('Remove project form file system');
  await removeProjectFromFile(projectDetail);
  console.log('Save project in file system');
  saveProjectToFile(projectDetail);
  console.log('Reset project');
  await updateProjectInRedis(projectDetail.uuid, projectDetail);
  await updateProjectInRedis(projectDetail.seoName, projectDetail);
  return projectDetail;
};

const processKMSDecryptionAll = async (projectDetail) => {
  const { encryptions } = projectDetail;
  if (!encryptions) {
    return projectDetail;
  }
  for (const encryption of encryptions) {
    if (encryption.isDataKeyEncrypted) {
      const result = await drapcodeEncryptDecrypt(encryption.dataKey, false);
      if (result.status === 'SUCCESS') {
        encryption.dataKey = result.data;
        encryption.isDataKeyEncrypted = false;
      }
    }
    if (encryption.isIvKeyEncrypted && encryption.iv) {
      const result = await drapcodeEncryptDecrypt(encryption.iv, false);
      if (result.status === 'SUCCESS') {
        encryption.iv = result.data;
        encryption.isIvKeyEncrypted = false;
      }
    }
  }
  return projectDetail;
};

export const loadProjectCollection = async (projectId, version, cleanPublish) => {
  console.log('### Load project collections from builder');
  const collections = await loadCollectionsFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project collections');
  await clearCollectionInRedis(projectId);
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'collections');
  } else {
    clearProjectFilesInSubfolder(projectId, 'collections', collections);
  }
  if (collections && collections.length > 0) {
    console.log('### Saving project collections');
    saveCollections(projectId, collections);
    await updateCollectionInRedis(projectId, collections);
  }
  return collections;
};

export const loadProjectDevapis = async (projectId, version, cleanPublish) => {
  console.log('### Load project dev apis from builder');
  const devApis = await loadDevapisFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project dev apis');
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'dev-apis');
  } else {
    clearProjectFilesInSubfolder(projectId, 'dev-apis', devApis);
  }
  if (devApis && devApis.length > 0) {
    console.log('### Saving project dev apis');
    await saveDevAPIs(projectId, devApis);
  }
  return devApis;
};

export const loadProjectEvents = async (projectId, version, cleanPublish) => {
  console.log('### Load project events from builder');
  const events = await loadEventsFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project events');
  await clearEventInRedis(projectId);
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'events');
  } else {
    clearProjectFilesInSubfolder(projectId, 'events', events);
  }
  if (events && events.length > 0) {
    console.log('### Saving project events');
    await saveEvents(projectId, events);
    await updateEventInRedis(projectId, events);
    return events;
  }
  return [];
};

export const loadProjectExternalApis = async (projectId, version, cleanPublish) => {
  console.log('### Load project external apis from builder');
  const externalApis = await loadExternalApisFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project external apis');
  await clearExternalAPIInRedis(projectId);
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'external-apis');
  } else {
    clearProjectFilesInSubfolder(projectId, 'external-apis', externalApis);
  }

  if (externalApis && externalApis.length > 0) {
    console.log('### Saving project external apis');
    await saveExternalApis(projectId, externalApis);
    await updateExternalAPIInRedis(projectId, externalApis);
    return externalApis;
  }
  return [];
};

export const loadProjectWebhooks = async (projectId, version, cleanPublish) => {
  console.log('### Load project webhooks from builder');
  const webhooks = await loadWebhooksFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project webhooks');
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'webhooks');
  } else {
    clearProjectFilesInSubfolder(projectId, 'webhooks', webhooks);
  }
  if (webhooks && webhooks.length > 0) {
    console.log('### Saving project webhooks');
    await saveWebhooks(projectId, webhooks);
    return webhooks;
  }
  return [];
};
export const loadProjectPages = async (projectId, version, cleanPublish) => {
  console.log('### Load project pages from builder');
  const pages = await loadPagesFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project pages');
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'pages');
  } else {
    console.log(
      'WE are inside the else condition in page and this is the value of isPublish: ',
      cleanPublish,
    );
    clearProjectFilesInSubfolder(projectId, 'pages', pages);
  }
  if (pages && pages.length > 0) {
    const fPages = pages.map((page) => {
      const clonedPage = { ...page };
      delete clonedPage.content;
      return clonedPage;
    });
    console.log('### Saving project pages');
    await saveProjectPages(projectId, fPages);
  }
  return pages;
};

export const loadLocalizations = async (projectId) => {
  console.log('### Load project localization from builder');
  const localizations = await loadLocalizationFromBuilder(projectId);
  console.log('### Clear project localizations');
  clearProjectSubfolder(projectId, 'localizations');
  await clearLocalizationInRedis(projectId);
  if (localizations && localizations.length > 0) {
    console.log('### Saving project localization');
    await saveLocalizations(projectId, localizations);
    await updateLocalizationInRedis(projectId, localizations);
  }
  return localizations;
};

export const loadCustomComponents = async (projectId, version, cleanPublish) => {
  try {
    console.log('### Load project custom components from builder');
    const customComponents = await loadCustomComponentsFromBuilder(
      projectId,
      version,
      cleanPublish,
    );
    console.log('### Clear project custom components');
    await clearCustomComponentInRedis(projectId);
    if (cleanPublish) {
      clearProjectSubfolder(projectId, 'custom-components');
    } else {
      clearProjectFilesInSubfolder(projectId, 'custom-components', customComponents);
    }
    if (customComponents && customComponents.length > 0) {
      console.log('### Saving project custom components');
      await saveCustomComponents(projectId, customComponents);
      await updateCustomComponentInRedis(projectId, customComponents);
    }
    return customComponents;
  } catch (error) {
    console.log('\n error :>> ', error);
  }
};

export const loadCustomDataMapping = async (projectId, cleanPublish) => {
  try {
    console.log('### Load project custom data mappings from builder');
    const customDataMapping = await loadCustomDataMappingFromBuilder(projectId, cleanPublish);
    console.log('### Clear project custom data mappings');
    await clearCustomMappingInRedis(projectId);
    if (cleanPublish) {
      clearProjectSubfolder(projectId, 'custom-data-mappings');
    } else {
      clearProjectFilesInSubfolder(projectId, 'custom-data-mappings', customDataMapping);
    }
    if (customDataMapping && customDataMapping.length > 0) {
      console.log('### Saving project custom data mappings');
      await saveCustomMappings(projectId, customDataMapping);
      await updateCustomMappingInRedis(projectId, customDataMapping);
    }
    return customDataMapping;
  } catch (error) {
    console.error('\n error :>> ', error);
  }
};

export const loadTaskScheduling = async (projectId, version) => {
  try {
    console.log('### Clear project tasks');
    clearProjectSubfolder(projectId, 'tasks');
    console.log('### Load project tasks from builder');
    let tasks = await loadTasksScheduleFromBuilder(projectId, version);
    tasks = tasks.schedules;
    if (tasks && tasks.length > 0) {
      console.log('### Saving project tasks');
      await saveTasks(projectId, tasks);
    }
  } catch (error) {
    console.error('\n error :>> ', error);
  }
};

export const loadProjectPlugins = async (projectId, version) => {
  console.log('### Clear project plugins');
  clearProjectSubfolder(projectId, 'plugins');
  await clearPluginInRedis(projectId);
  console.log('### Load project plugins from builder');
  const plugins = await loadPluginsFromBuilder(projectId, version);
  if (plugins && plugins.length > 0) {
    console.log('### Saving project plugins');
    await savePlugins(projectId, plugins);
    await updatePluginInRedis(projectId, plugins);
  }
  return plugins;
};
export const loadProjectTemplates = async (projectId, version, cleanPublish) => {
  console.log('### Load project templates from builder');
  const templates = await loadTemplatesFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project templates');
  await clearTemplateInRedis(projectId);
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'templates');
  } else {
    clearProjectFilesInSubfolder(projectId, 'templates', templates);
  }
  if (templates && templates.length > 0) {
    console.log('### Saving project templates');
    await saveTemplates(projectId, templates);
    await updateTemplateInRedis(projectId, templates);
  }
  return templates;
};
export const loadProjectSnippets = async (projectId, version, cleanPublish) => {
  console.log('### Load project snippets from builder');
  const snippets = await loadSnippetsFromBuilder(projectId, version, cleanPublish);
  console.log('### Clear project snippets');
  await clearSnippetInRedis(projectId);
  if (cleanPublish) {
    clearProjectSubfolder(projectId, 'snippets');
  } else {
    clearProjectFilesInSubfolder(projectId, 'snippets', snippets);
  }
  if (snippets && snippets.length > 0) {
    console.log('### Saving project snippets');
    await saveSnippets(projectId, snippets);
    await updateSnippetInRedis(projectId, snippets);
    clearProjectSubfolder;
  }
  return snippets;
};

export const loadProjectExternalDbs = async (projectId, version) => {
  console.log('### Clear project external dbs');
  clearProjectSubfolder(projectId, 'external-dbs');
  console.log('### Loading project external dbs from builder');
  const externalDbs = await loadExternalDbsFromBuilder(projectId, version);
  if (externalDbs && externalDbs.length > 0) {
    console.log('### Saving project external dbs');
    await saveExternalDbs(projectId, externalDbs);
    await updateExternalDBInRedis(projectId, externalDbs);
    return externalDbs;
  }
  return [];
};

export const projectDetail = async (req, res, next) => {
  const apiEnterUuid = uuidv4();
  try {
    createProfilerService(
      req.db,
      req.projectId,
      req.enableProfiling,
      apiEnterUuid,
      API,
      `PROJECT -> projectDetail`,
    );
    const response = await findProjectByQuery(req.projectId);
    updateProfilerService(req.db, req.projectId, req.enableProfiling, apiEnterUuid);
    res.status(200).send(response);
  } catch (e) {
    next(e);
  }
};

export const populateProjectSettingOnRequest = (req, project, environment) => {
  const {
    uuid,
    name,
    createdAt,
    constants,
    timezone,
    connectorApiKey,
    url,
    dateFormat,
    enableProfiling,
    debugMode,
    enableAuditTrail,
    projectType,
    seoName,
    content,
  } = project;

  req.projectId = uuid;
  req.timezone = timezone;
  req.seoName = seoName;
  req.dateFormat = dateFormat;
  req.enableProfiling = enableProfiling;
  req.enableAuditTrail = enableAuditTrail;
  req.projectType = projectType;

  req.robotsTxt = content ? content.robotsTxt : '';
  req.sitemapXml = content ? content.sitemapXml : '';

  const commonProject = {
    uuid: uuid,
    projectId: uuid,
    projectName: name,
    projectCreatedAt: createdAt,
    projectConstants: constants,
    timezone: timezone,
    connectorApiKey: connectorApiKey,
    projectUrl: url,
    dateFormat: dateFormat,
    enableProfiling: enableProfiling,
    debugMode: debugMode,
    enableAuditTrail: enableAuditTrail,
  };
  if (!environment) {
    console.log('No Environment set so return default value');
    return { ...commonProject, encryption: null, enableEncryption: false };
  }

  environment = environment.toLowerCase().trim();
  const { enableEncryption, encryption } = loadProjectEncryption(project, environment);
  return { ...commonProject, enableEncryption, encryption };
};

export const getProjectEncryption = async (projectId) => {
  let encryption = null;
  let environment = process.env.APP_ENV || '';
  if (!environment) {
    return { enableEncryption: false, encryption };
  }

  environment = environment.toLowerCase().trim();
  const project = await findProjectByQuery(projectId);
  return loadProjectEncryption(project, environment);
};

const loadProjectEncryption = async (project, environment) => {
  const { enableEncryption, encryptions, encryptionType } = project;
  if (!enableEncryption || !encryptions || !encryptions.length) {
    return { enableEncryption, encryption: null };
  }

  let encryption = encryptions.find((enc) => enc.envType.toLowerCase() === environment);
  if (!encryption) {
    return { enableEncryption, encryption };
  }
  if (encryption.isDataKeyEncrypted) {
    const result = await drapcodeEncryptDecrypt(encryption.dataKey, false);
    if (result.status === 'SUCCESS') {
      encryption.dataKey = result.data;
    } else {
      return result;
    }
  }
  //TODO: Check do we need this
  if (encryption.isIvKeyEncrypted && encryption.iv) {
    const result = await drapcodeEncryptDecrypt(encryption.iv, false);
    if (result.status === 'SUCCESS') {
      encryption.iv = result.data;
      encryption.isIvKeyEncrypted = false;
    }
  }
  //Now generate client's private key
  encryption = await processKey(encryption, encryptionType);
  return { enableEncryption, encryption };
};
