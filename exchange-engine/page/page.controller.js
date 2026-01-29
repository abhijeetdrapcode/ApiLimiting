import { existsSync, createReadStream } from 'fs';
import * as cheerio from 'cheerio';
// import hbs from 'hbs';
import { ERROR_404_PAGE } from 'drapcode-constant';
import { redis_get_method, common_set_method } from 'drapcode-redis';
import { cookieConfig, ignoreUrls } from '../middleware/route.middleware';
import {
  addProjectEnvOnPage,
  getPageByUrl,
  jsDomClearVisibilityAttr,
  jsDomDetailPageContent,
  jsDomPageContent,
  multiTenantHandlePageElements,
} from '../page/page.service';
import { findAllInstalledPlugin } from '../install-plugin/installedPlugin.service';
import { findOneCollectionService } from '../collection/collection.service';
import { findItemForBuilderByRegex } from '../item/item.builder.service';
import { findOneItem } from '../item/item.service';
import { prepareS3Url } from '../utils/utils';

// const getCompiledTemplate = async (redisKey, pagePath) => {
//   //Scenario 1: This store normal file content and return compiled
//   // const cacheTemplate = await redis_get_method(redisKey);
//   let template;
//   // if (cacheTemplate) {
//   //   template = cacheTemplate;
//   // } else {
//   template = await readFileSync(pagePath, 'utf-8');
//   // await common_set_method(redisKey, template, 300); //30 mins
//   // }
//   console.log('template :>> ', template);
//   const compiled = hbs.compile(template);
//   return compiled;
// };

export const getFirstOptimizePage = async (req, res, next) => {
  try {
    const { projectId, params, seoName, environment, language, url, user, urlEnv } = req;
    const isIgnore = ignoreUrls(url);
    if (isIgnore) {
      return next();
    }
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    let { pageId, itemId, collectionName } = params;
    if (['lib', 'js'].includes(pageId)) {
      console.log('***** Since it is for lib then do not check *****');
      return next();
    }
    let pageResponse = await getPageByUrl(projectId, pageId);
    if (!pageResponse) {
      /** Get Error 404 page. */
      pageResponse = await getPageByUrl(projectId, ERROR_404_PAGE);
      /** Fallback when no Error 404 page found. */
      if (!pageResponse) {
        return res.send('Error Page');
      }
    }
    pageId = pageResponse.slug;
    const pageKey = `${projectId}/${language}/${pageId}/${pageId}`;
    const pagePath = `${process.env.BUILD_FOLDER}views/${pageKey}.hbs`;
    console.log('pagePath :>> ', pagePath);
    if (!existsSync(pagePath)) {
      return res.send('Please publish the project to view it.');
    }

    let pageContent = '';
    let readerStream = createReadStream(pagePath);
    readerStream.setEncoding('UTF8');
    readerStream.on('data', (chunk) => {
      pageContent += chunk.toString();
    });

    readerStream.on('error', (err) => {
      console.error('err.stack :>> ', err.stack);
      return res.write(
        'There is some issue reading your build. Please publish the project to view it.',
      );
    });

    readerStream.on('end', async () => {
      if (itemId && itemId.includes('_')) {
        itemId = itemId.split('_')[1];
      }

      const installedPlugins = await findAllInstalledPlugin(projectId);
      let s3Url = await prepareS3Url(installedPlugins, environment);
      console.log('s3Url :>> ', s3Url);
      if (itemId && collectionName && shouldTitleFromCollection(pageResponse)) {
        pageContent = await getDynamicTitle(req, itemId, pageResponse, pageContent, s3Url);
      }
      pageContent = addMetaURL(pageContent, pageId, fullUrl);
      pageContent = await jsDomPageContent(environment, user, pageContent);
      pageContent = addProjectEnvOnPage(environment, pageContent);
      pageContent = await loadMultiTenantPluginScript(req, pageId, pageContent, installedPlugins);

      pageContent = await jsDomDetailPageContent(req, res, pageResponse, pageContent, s3Url);
      pageContent = jsDomClearVisibilityAttr(pageContent);

      res.cookie('projectSeoName', seoName, cookieConfig);
      res.cookie('environment', urlEnv, cookieConfig);
      res.cookie('S3URL', s3Url, cookieConfig);
      res.cookie('__pageId', pageResponse?.uuid, cookieConfig);
      // Set cookie for Derived Field Mapping
      if (pageResponse && pageResponse?.derivedFieldMapping) {
        res.cookie('derivedFieldMapping', pageResponse?.derivedFieldMapping, cookieConfig);
      } else {
        res.cookie('derivedFieldMapping', '', { ...cookieConfig, maxAge: 0 });
      }
      // Set cookie for External API based pages
      if (pageResponse && pageResponse?.externalApiId) {
        if (pageResponse?.collectionFrom && pageResponse?.collectionFrom === 'EXTERNAL_API') {
          res.cookie('__pageExternalAPI', pageResponse?.externalApiId, cookieConfig);
        } else {
          res.cookie('__pageExternalAPI', '', { ...cookieConfig, maxAge: 0 });
        }
      } else {
        res.cookie('__pageExternalAPI', '', { ...cookieConfig, maxAge: 0 });
      }

      return res.send(pageContent);
    });
  } catch (error) {
    console.error('error :>> ', error);
    next(error);
  }
};

const shouldTitleFromCollection = (pageResponse) =>
  !!pageResponse &&
  (pageResponse.isDescriptionFromCollection ||
    pageResponse.isTitleFromCollection ||
    pageResponse.isPageImageFromCollection);

const getDynamicTitle = async (req, itemId, pageResponse, pageContent, s3Url) => {
  const { projectId, db, user, project } = req;
  let {
    collectionId,
    titleTag,
    description,
    pageImage,
    isTitleFromCollection,
    isPageImageFromCollection,
    isDescriptionFromCollection,
  } = pageResponse;

  const redisKey = `seo:${projectId}:${collectionId}:${itemId}`;
  const cachedSeoHtml = await redis_get_method(redisKey);
  if (cachedSeoHtml) return cachedSeoHtml;

  let data = await findOneItem(projectId, db, collectionId, itemId, pageResponse, user);
  if (!data) return pageContent;

  const $ = cheerio.load(pageContent);

  if (isTitleFromCollection && data[titleTag]) {
    const val = data[titleTag];
    $('title').text(val);
    $('meta[name="title"]').attr('content', val);
    $('meta[property="og:title"]').attr('content', val);
    $('meta[property="twitter:title"]').attr('content', val);
  }

  if (isDescriptionFromCollection && data[description]) {
    const val = data[description];
    $('meta[name="description"]').attr('content', val);
    $('meta[property="og:description"]').attr('content', val);
    $('meta[property="twitter:description"]').attr('content', val);
  }

  let seoImageToReplace = 'https://drapcode.com/img/DrapCode-Icon-Dark.png';

  if (pageImage) {
    const pageImageData = data[pageImage];

    if (pageImageData && pageImageData.key) {
      seoImageToReplace = `${s3Url}${pageImageData.key}`;
    } else if (project.projectLogoKeyName) {
      seoImageToReplace = `${s3Url}${project.projectLogoKeyName}`;
    }
  }

  if (isPageImageFromCollection && seoImageToReplace) {
    $('meta[property="og:image"]').attr('content', seoImageToReplace);
    $('meta[property="twitter:image"]').attr('content', seoImageToReplace);
  }

  const finalHtml = $.html();
  //This will set dynamic title to fix for 1 min.
  await common_set_method(redisKey, finalHtml, 60);
  return finalHtml;
};

const addMetaURL = (pageContent, pageId, fullUrl) => {
  if (!fullUrl) return pageContent;

  const secureUrl = fullUrl.startsWith('http://')
    ? fullUrl.replace('http://', 'https://')
    : fullUrl;

  const $ = cheerio.load(pageContent);
  let ogUrlTag = $('meta[property="og:url"]');
  if (ogUrlTag.length) {
    ogUrlTag.attr('content', secureUrl);
  } else {
    $('head').append(`<meta property="og:url" content="${secureUrl}">`);
  }

  // Update or create twitter:url
  let twitterUrlTag = $('meta[property="twitter:url"]');
  if (twitterUrlTag.length) {
    twitterUrlTag.attr('content', secureUrl);
  } else {
    $('head').append(`<meta property="twitter:url" content="${secureUrl}">`);
  }
  // Add a canonical link tag for SEO
  let canonicalTag = $('link[rel="canonical"]');
  if (canonicalTag.length) {
    canonicalTag.attr('href', secureUrl);
  } else {
    $('head').append(`<link rel="canonical" href="${secureUrl}">`);
  }

  return $.html();
};

const loadMultiTenantPluginScript = async (req, pageId, pageContent, installedPlugins) => {
  const multiTenantSAASPlugin = installedPlugins.find((e) => e.code === 'MULTI_TENANT_SAAS');
  if (!multiTenantSAASPlugin) {
    return pageContent;
  }

  const { multiTenantCollection } = multiTenantSAASPlugin.setting || {};
  if (!multiTenantCollection) return pageContent;

  const { db, projectId, user } = req;
  const collection = await findOneCollectionService(projectId, multiTenantCollection);
  if (!collection) return pageContent;

  let items = await findItemForBuilderByRegex(db, collection.collectionName, {
    regex: `^${pageId}`,
  });
  if (!items?.length) return pageContent;

  if (req.isAuthenticated?.()) {
    const userRoles = user?.userRoles || [];
    const tenantIds = Array.isArray(user?.tenantId) ? user.tenantId.map((t) => t._id) : [];

    items = items.filter((i) => {
      const roleMatch = !i.userRoles?.length || i.userRoles.some((r) => userRoles.includes(r));
      const tenantMatch = !tenantIds.length || tenantIds.includes(i._id);
      return roleMatch && tenantMatch;
    });
  } else {
    items = items.filter((i) => !i.userRoles?.length);
  }

  const $ = cheerio.load(pageContent);
  for (const item of items) {
    const permission = item.permission?.join('') || '';
    for (const componentString of item.pageComponents || []) {
      multiTenantHandlePageElements(componentString, $, permission);
    }
  }

  return $.html();
};
