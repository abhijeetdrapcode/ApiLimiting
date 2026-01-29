import pLimit from 'p-limit'; // add at top of your file
import os from 'os';
import fs from 'fs';
import hbs from 'hbs';
import { replaceValueFromSource, loadPages } from 'drapcode-utility';
import {
  brandMessage,
  pageNotFound,
  getTimezoneOffset,
  replaceNbsps,
  pluginCode,
  getAssetLink, //TODO: Verify it
} from 'drapcode-constant';
import { logger } from 'drapcode-logger';
import { common_clear_method } from 'drapcode-redis';
import UglifyJS from 'uglify-js';
import {
  loadProjectCollection,
  loadProjectDetail,
  loadProjectEvents,
  loadProjectPages,
  loadProjectPlugins,
  loadProjectSnippets,
  loadProjectExternalApis,
  loadProjectWebhooks,
  loadProjectTemplates,
  loadLocalizations,
  loadCustomComponents,
  loadCustomDataMapping,
  loadTaskScheduling,
  loadProjectDevapis,
  loadProjectExternalDbs,
} from './project.service';
import { extractEnvironment } from '../config/envUtil';
import {
  addLocalizationDataIntoElements,
  addPageCustomScript,
  addPageExternalScriptUrl,
  addPageLayoutToPage,
  addProjectCustomJSCdn,
  addSnipcartElement,
  addStyleNoneToCMS,
  atomChatPluginScript,
  checkAndCreateValidationJS,
  checkAndExtractComponent,
  cleanProjectFolder,
  extractHtmlCssAndJsFromSnippets,
  filterExtension,
  iterateSnippetsAndReplace,
  generateProjectCustomCSSContentLink,
  generateProjectCustomScriptContentLink,
  generateProjectEventLink,
  renderForPageExternalAPI,
  renderHeadSection,
  renderScriptSection,
  saveFile,
  socialScript,
  addLinkToHeaderCSS,
  getFullScreenLoader,
  getFullScreenScript,
  clearProjectViewsFolder,
} from './build-utils';
// import { findSnippet } from '../email-template/snippet.service';
import { extractLoginPluginSetting } from '../security/jwtUtils';
const brand_msg = process.env.BRAND_MSG || 'Made with DrapCode';
const buildFolder = process.env.BUILD_FOLDER;
const path = require('path');
let regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;

const CONCURRENCY_LIMIT = Math.min(10, Math.max(4, Math.floor(os.cpus().length * 1.5)));

export const deleteProject = async (req, res) => {
  const { projectId } = req;
  const refPath = `${buildFolder}views/${projectId}`;
  fs.rmdirSync(refPath, { recursive: true });
  res.status(200).json({});
};

/**
 * TODO
 * 1. Need to add recaptcha
 * 2. Need to add shopping cart js
 * 4. Filter Model on the basis of events
 */
export const buildProject = async (req, res) => {
  console.time('loadProjectPages');

  const { params, body } = req;
  const { projectId, version } = params;
  const { subscription } = body;
  // const { subscription, cleanPublish } = body;

  // if (cleanPublish === undefined) {
  //   body.cleanPublish = true;
  // }
  let cleanPublish = true;

  const project = await loadProjectDetail(projectId, version, subscription);
  if (!project) {
    return res.status(400).json({ success: false, message: 'No Project found with this ID' });
  }

  const environment = extractEnvironment(project.environments);
  /**
   * Clean Project Folder
   */
  const errorLabel = `${projectId}/${project?.seoName}`;
  if (cleanPublish) {
    console.log('The entire folder is getting cleaned');
    cleanProjectFolder(buildFolder, projectId);
  } else {
    clearProjectViewsFolder(buildFolder, projectId);
  }
  console.log('**************************************************************************');
  logger.info('Making build...', { label: errorLabel, color: 'yellow' });
  console.log('**************************************************************************');
  try {
    const [pages, localizations, extensions, collections, snippetsRaw, events, externalAPIs] =
      await Promise.all([
        loadProjectPages(projectId, version, cleanPublish),
        loadLocalizations(projectId, cleanPublish),
        loadProjectPlugins(projectId, version),
        loadProjectCollection(projectId, version, cleanPublish),
        loadProjectSnippets(projectId, version, cleanPublish),
        loadProjectEvents(projectId, version, cleanPublish),
        loadProjectExternalApis(projectId, version, cleanPublish),
      ]);
    await Promise.all([
      loadProjectDevapis(projectId, version, cleanPublish),
      loadProjectWebhooks(projectId, version, cleanPublish),
      loadProjectTemplates(projectId, version, cleanPublish),
      loadCustomComponents(projectId, version, cleanPublish),
      loadCustomDataMapping(projectId, cleanPublish),
      loadTaskScheduling(projectId, version),
      loadProjectExternalDbs(projectId, version),
    ]);

    const mapPlugin = extensions.find((plugin) => plugin.code === pluginCode.GOOGLE_MAP);
    const atomChatPlugin = extensions.find((plugin) => plugin.code === pluginCode.ATOM_CHAT);
    const snipcartPlugin = extensions.find((plugin) => plugin.code === pluginCode.SNIPCART);
    const bngPaymentPlugin = extensions.find((plugin) => plugin.code === pluginCode.BNG_PAYMENT);
    const fluidPayPlugin = extensions.find((plugin) => plugin.code === pluginCode.FLUID_PAY);
    const loginPlugin = extensions.find((plugin) => plugin.code === pluginCode.LOGIN);
    const plugins = {
      mapPlugin,
      atomChatPlugin,
      snipcartPlugin,
      bngPaymentPlugin,
      fluidPayPlugin,
    };
    const faviconUrl = project.faviconKeyName
      ? `${process.env.S3_BUCKET_URL}/${project.faviconKeyName}`
      : 'https://drapcode.com/favicon.png';
    const snippetMap = new Map(snippetsRaw.map((s) => [s.uuid, s.content || s]));

    let snippets = extractHtmlCssAndJsFromSnippets(snippetsRaw);
    const onlySnippets = snippets.filter((snippet) => snippet.snippetType === 'SNIPPET');

    const timeZone = getTimezoneOffset(project.timezone);
    const publishTimestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const customCSSURL = generateProjectCustomCSSContentLink(publishTimestamp, project);
    const customJSURL = generateProjectCustomScriptContentLink(publishTimestamp, project);
    const customEventURL = generateProjectEventLink(publishTimestamp, project, events);
    logger.info('Processing pages...', {
      label: errorLabel,
      color: 'yellow',
    });

    const templatePath = path.join(__dirname, '../views/index.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = hbs.compile(templateContent);

    // Filter Plugins with auto add to body
    const pluginsAutoAddToBody = extensions.filter((plugin) => plugin.autoAddToBody);
    //Filter Plugins With CSS and JS
    const pluginsWithCssAndJs = filterExtension(extensions);

    const context = {
      collections,
      environment,
      externalAPIs,
      faviconUrl,
      localizations,
      project,
      pages,
      plugins,
      customCSSURL,
      publishTimestamp,
      snippets: onlySnippets,
      timeZone,
      template,
      pluginsAutoAddToBody,
      pluginsWithCssAndJs,
      snippetMap,
    };

    const { inActivityLimit, logoutRedirectPage } = extractLoginPluginSetting(
      loginPlugin,
      environment,
    );

    let brandPlaceholder = '';
    if (project.projectType === 'FREE') {
      brandPlaceholder = brandMessage(brand_msg);
    }

    let projectEventURL = '';
    let projectEventLinkURL = '';
    if (customEventURL && Object.keys(customEventURL).length) {
      const { eventURL, eventLinkURL } = customEventURL;
      projectEventURL = eventURL || '';
      projectEventLinkURL = eventLinkURL || '';
    }

    let projectCustomScriptURL = '';
    let projectCustomScriptLinkURL = '';
    if (customJSURL && Object.keys(customJSURL).length) {
      const { customScriptURL, customScriptLinkURL } = customJSURL;
      projectCustomScriptURL = customScriptURL || '';
      projectCustomScriptLinkURL = customScriptLinkURL || '';
    }

    let eventsScript = [];
    if (projectEventURL) {
      eventsScript.push(projectEventURL);
    }

    const { loaderScreen } = project;
    let fullScreenScript = '';
    let fullScreenLoader = '';
    const { isEnabled: fullScreenLoaderIsEnabled } = loaderScreen || {};
    if (fullScreenLoaderIsEnabled) {
      fullScreenScript = getFullScreenScript(project);
      fullScreenLoader = getFullScreenLoader(project);
    }

    const extraContext = {
      inActivityLimit,
      logoutRedirectPage,
      fullScreenScript,
      fullScreenLoader,
      brandPlaceholder,
      eventsScript,
      projectEventLinkURL,
      projectCustomScriptURL,
      projectCustomScriptLinkURL,
    };

    await processPages(context, extraContext);

    logger.info('Pages processed successfully!', {
      label: errorLabel,
      color: 'green',
    });
    console.log('**************************************************************************');
    logger.info('Build completed successfully!', {
      label: errorLabel,
      color: 'green',
    });
    console.log('**************************************************************************');
    console.timeEnd('loadProjectPages');

    res.status(200).json({ success: true, message: 'Build Success' });
  } catch (error) {
    console.error('*** Build completed with an error :>>', error);
    logger.error('Build error', { error, label: errorLabel });
    res.status(400).json({ success: false, error });
  }
};

const processPages = async (context, extraContext) => {
  const { pages, externalAPIs, project, snippetMap } = context;

  const limit = pLimit(CONCURRENCY_LIMIT);

  const tasks = pages.map((page) =>
    limit(async () => {
      console.log('page.name start:>> ', page.name);
      let pageExternalAPI = '';
      if (page.collectionFrom && page.collectionFrom === 'EXTERNAL_API') {
        pageExternalAPI = externalAPIs.find(
          (externalApi) => externalApi.uuid === page.externalApiId,
        );
      }
      let layout = '';
      if (page?.pageLayoutId) {
        layout = snippetMap.get(page.pageLayoutId) || '';
        // layout = await findSnippet(project.uuid, page?.pageLayoutId);
        if (layout && layout.content) {
          delete layout.content['nocode-assets'];
          layout = layout?.content || '';
        }
      }
      await prepareAndSavePageHTML(
        context,
        extraContext,
        page,
        pageExternalAPI,
        project.dateFormat,
        layout,
      );
      console.log('page.name end:>> ', page.name);
    }),
  );

  await Promise.all(tasks);
};
//499844

const prepareAndSavePageHTML = async (
  context,
  extraContext,
  page,
  pageExternalAPI,
  dateFormat,
  layout = '',
) => {
  const {
    project,
    faviconUrl,
    timeZone,
    localizations,
    publishTimestamp,
    template,
    pluginsWithCssAndJs,
  } = context;
  console.log('prepareAndSavePageHTML 1');
  const {
    projectEventLinkURL,
    projectCustomScriptURL,
    projectCustomScriptLinkURL,
    inActivityLimit,
    logoutRedirectPage,
    fullScreenScript,
    fullScreenLoader,
    brandPlaceholder,
    eventsScript,
  } = extraContext;
  console.log('Start page :>> ', page.name);

  const prepareHeader = renderHeadSection(buildFolder, context, pluginsWithCssAndJs, page);

  [projectEventLinkURL, projectCustomScriptLinkURL]
    .filter(Boolean)
    .forEach((url) => addLinkToHeaderCSS(prepareHeader, url));
  console.log('prepareAndSavePageHTML 3');

  await Promise.allSettled(
    localizations.map(async (local) => {
      /**
       * Generate Body Section
       * Returns
       * {bodyCSS} contains style of current page and all snippets used in it
       * {bodyJS} contains JS of current page and all the JS used in it
       * {mainContent} HTML of the page and snippets HTML
       */
      const redisKey = `rendered:${project.uuid}:${local}:${page.uuid}`;
      console.log('redisKey :>> ', redisKey);
      await common_clear_method(redisKey);

      const prepareBody = await renderBodySection(context, page, pageExternalAPI, local, layout);

      if (projectCustomScriptURL) {
        prepareBody['projectCustomScriptUrl'] = projectCustomScriptURL;
      }

      prepareBody['brandMessage'] = brandPlaceholder;
      prepareBody['fullScreenLoader'] = fullScreenLoader;
      prepareBody['fullScreenLoaderScript'] = fullScreenScript;

      console.log('::2');
      const pageDirection = page && page.pageDirection ? page.pageDirection : 'ltr';

      /**
       * Generate Template
       */
      const finalHtmlContent = template({
        ...prepareHeader,
        ...prepareBody,
        // NEW → default cleanPublish = true for all envs
        faviconUrl,
        timeZone,
        eventsScript,
        pageDirection,
        dateFormat,
        publishTimestamp,
        inActivityLimit,
        logoutRedirectPage,
      });
      console.log('::5');
      /**
       * Save HTML File
       */
      console.log('::6');
      const refPath = `${buildFolder}views/${project.uuid}/${local.language}`;
      console.log('This is the refPath from prepareAndSavePageHTML: ', refPath);
      await saveFile(finalHtmlContent, refPath, `${page.slug}`, `${page.slug}.hbs`);
      console.log('End page :>> ', page.name);
    }),
  );
};

const hasDynamicDataTable = (content) => {
  return content?.includes('data-js="data-table-dynamic"');
};

const hasCalendarComponent = (content) => {
  return (
    content?.includes('data-js="calendar"') || content?.includes('data-js="calendar-timeslot"')
  );
};

const handleAtomChatPlugin = (pageContent, plugins, environment, bodyJS) => {
  const { atomChatPlugin } = plugins;
  if (!atomChatPlugin || atomChatPlugin.code) return;

  console.log('4');
  const haveChat = pageContent ? pageContent.includes('id="atomchat"') : false;
  if (haveChat) {
    console.log('5', pageContent);
    pageContent = pageContent.replace(
      '<img src="https://public-webconnect.s3.amazonaws.com/atomchat.png" alt="atomchat" class="atomchat">',
      '<div id="cometchat_embed_synergy_container" style="width:100%;height:100%;max-width:100%;overflow:hidden;"></div>',
    );
    console.log('6');
    const { setting } = atomChatPlugin;
    console.log('7');
    let { api_id, auth_key } = setting;
    console.log('8');
    api_id = replaceValueFromSource(api_id, environment, null);
    console.log('9');
    auth_key = replaceValueFromSource(auth_key, environment, null);
    console.log('10');
    bodyJS.push(atomChatPluginScript(api_id, auth_key));
    console.log('11');
  }
};

const handleFluidPlugin = (plugins, environment, bodyJS) => {
  const { fluidPayPlugin } = plugins;
  if (!fluidPayPlugin) return;

  const { setting } = fluidPayPlugin;
  let { scriptUrl } = setting;
  console.log('13');
  scriptUrl = replaceValueFromSource(scriptUrl, environment, null);
  console.log('14');
  bodyJS.push(`<script type="text/javascript" src="${scriptUrl}"></script>`);
};

const buildCommonScripts = (project, pluginsWithCssAndJs, pluginsWithAutoAddToBody, page) => {
  const { slug, eventName } = page;
  const bodyJS = renderScriptSection(pluginsWithCssAndJs, pluginsWithAutoAddToBody);
  if (['oauth2-loading-page', 'facebook-loading-page', 'twitter-loading-page'].includes(slug)) {
    bodyJS.push(socialScript);
  }

  console.log('15');
  addProjectCustomJSCdn(project, bodyJS);
  console.log('16');
  addPageExternalScriptUrl(page, bodyJS);
  addPageCustomScript(page, bodyJS);
  console.log('17');
  bodyJS.push(
    '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/timepicker@1.14.1/jquery.timepicker.min.js"></script>',
  );

  if (eventName) {
    bodyJS.push(`<script> 
                    $(window).on('load', function() {
                      const url_params = Object.fromEntries(new URLSearchParams(window.location.search));
                      setTimeout(() => {
                        ${eventName}(null, url_params);
                      }, 500)
                    });
              </script>`);
  }
  return bodyJS;
};

const buildBodyScripts = (context, pageContent) => {
  const { environment, plugins } = context;
  const bodyJS = [];
  //atomchat plugin
  handleAtomChatPlugin(pageContent, plugins, environment, bodyJS);
  handleFluidPlugin(plugins, environment, bodyJS);

  if (hasDynamicDataTable(pageContent)) {
    bodyJS.push(
      '<script type="text/javascript" src="https://cdn.datatables.net/1.13.2/js/jquery.dataTables.min.js"></script>',
    );
  }

  if (hasCalendarComponent(pageContent)) {
    bodyJS.push(
      '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.js"></script>',
    );
  }

  return bodyJS;
};

const buildBodyStyles = (content, layout, componentStyles) => {
  const bodyCSS = [];
  bodyCSS.push(`<style>${content['nocode-css']}</style>`);
  console.log('27');
  if (componentStyles) {
    componentStyles.forEach((style) => bodyCSS.push(`<style>${style}</style>`));
  }
  console.log('28');
  return bodyCSS;
};

const addMinifiedJS = (scripts, bodyJS) => {
  if (!scripts?.length) return;
  const result = UglifyJS.minify(scripts.join(' '), { ie8: true });
  bodyJS.push(`<script>${result.code || scripts.join(' ')}</script>`);
};

const pageNotFoundRes = (bodyJS, bodyCSS) => {
  bodyCSS.push(
    `<link rel='stylesheet' type='text/css' href='${getAssetLink('css/dc-error-page.min.css')}'>`,
  );
  return {
    mainContent: pageNotFound(),
    bodyJS,
    bodyCSS,
  };
};

const renderBodySection = async (context, page, pageExternalAPI, localization, layout = '') => {
  console.log('bodySection 1');
  const {
    snippets,
    collections,
    plugins,
    environment,
    project,
    pluginsWithCssAndJs,
    pluginsAutoAddToBody,
  } = context;
  console.log('bodySection 2');
  const commonBodyJS = buildCommonScripts(project, pluginsWithCssAndJs, pluginsAutoAddToBody, page);
  console.log('bodySection 3', commonBodyJS.length);
  const commonBodyCSS = [`<style>${layout['nocode-css']}</style>`];
  const { content } = page;
  if (!content) {
    console.log('bodySection 4');
    return pageNotFoundRes(commonBodyJS, commonBodyCSS);
  }
  console.log('bodySection 5');
  let pageHtmlContent = content['nocode-html'] || '';
  if (!pageHtmlContent) {
    console.log('bodySection 6');
    return pageNotFoundRes(commonBodyJS, commonBodyCSS);
  }
  console.log('bodySection 7');

  const listComponents = checkAndExtractComponent(content);
  const allValidations = checkAndCreateValidationJS(collections, listComponents);
  console.log('bodySection 8');

  let pageContent = pageHtmlContent.replace(regex, '');
  pageContent = replaceNbsps(pageContent);
  console.log('bodySection 9');
  const componentScripts = [];
  const componentStyles = [];
  if (pageContent) {
    console.log('bodySection 10');
    pageContent = iterateSnippetsAndReplace(
      pageContent,
      snippets,
      componentScripts,
      componentStyles,
    );
    pageContent = addStyleNoneToCMS(pageContent);
    pageContent = addPageLayoutToPage(layout, pageContent);
    pageContent = addLocalizationDataIntoElements(pageContent, localization);
  }
  console.log('bodySection 11');

  const bodyJS = buildBodyScripts(context, pageContent);
  console.log('bodySection 12');

  const pageScript = regex.exec(pageHtmlContent);
  if (pageScript && pageScript.length) {
    componentScripts.push(pageScript[1]);
  }
  console.log('bodySection 13');

  pageContent = addSnipcartElement(plugins.snipcartPlugin, pageContent, environment);
  pageContent = renderForPageExternalAPI(page, pageContent, pageExternalAPI);
  console.log('bodySection 14');

  /**
   * Add combined JS and Minified
   */
  addMinifiedJS(componentScripts, bodyJS);
  addMinifiedJS(allValidations, bodyJS);
  console.log('bodySection 15');

  const bodyCSS = buildBodyStyles(content, layout, componentStyles);
  console.log('bodySection 16');

  return {
    mainContent: pageContent,
    bodyJS: [...commonBodyJS, ...bodyJS],
    bodyCSS: [...bodyCSS, ...commonBodyCSS],
  };
};

export const listProjectPages = async (req, res, next) => {
  try {
    const { projectId } = req;
    let pages = loadPages(projectId);

    pages = pages.filter((page) => !page.isHidden);
    pages = pages.map((page) => ({ name: page.name, slug: page.slug, uuid: page.uuid, projectId }));
    res.status(200).send(pages);
  } catch (error) {
    console.error('page list ~ error:', error);
    next(error);
  }
};

// const isSummernoteEditorJsCssToAdd = (listComponents) => {
//   return listComponents.find((comp) => comp && comp.tagName === 'textarea');
// };

// const isFlatPickerJsCssToAdd = (listComponents) => {
//   return listComponents.find((comp) => {
//     if (comp && comp.attributes) {
//       return (
//         Object.keys(comp.attributes).includes('type') &&
//         (comp.attributes.type === 'datetime-local' || comp.attributes.type === 'date')
//       );
//     }
//   });
// };

// const isIntlTelInputJsCssToAdd = (listComponents) => {
//   return listComponents.find((comp) => {
//     if (comp && comp.attributes) {
//       return Object.keys(comp.attributes).includes('type') && comp.attributes.type === 'tel';
//     }
//   });
// };
