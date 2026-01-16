import { pluginCode } from 'drapcode-constant';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
import { validateSnipcartItem } from '../item/item.service';
import { prepareS3Url } from '../utils/utils';

export const getRobotsTxt = async (req, res, next) => {
  try {
    const robotsTxtData = req.robotsTxt;
    res.write(`${robotsTxtData}`);
    res.end();
  } catch (e) {
    next(e);
  }
};

export const getSitemapXml = async (req, res, next) => {
  try {
    const sitemapXmlData = req.sitemapXml;
    if (!sitemapXmlData) {
      return res.status(404).send('Sitemap XML data not found.');
    }
    res.setHeader('Content-Type', 'application/xml');
    res.end(sitemapXmlData);
  } catch (error) {
    next(error);
  }
};

export const getManifestJson = async (req, res, next) => {
  console.log('==> ########### getManifestJson  :>> ');
  const { project, projectName, projectId, environment: pEnvironment } = req;
  const { name, shortName, description, icon } = project.pwaConfig ? project.pwaConfig : '';

  //Load plugin
  let s3Url = await prepareS3Url(null, pEnvironment, true);

  try {
    let manifest = {
      name: name ? name : projectName ? projectName : 'DrapCode | Build Awesome Web Applications',
      short_name: shortName ? shortName : projectName ? projectName : 'DrapCode',
      description: description
        ? description
        : project.description
        ? project.description
        : projectName
        ? projectName
        : 'DrapCode | Build Awesome Web Applications',
      icons: [
        {
          src: icon
            ? `${s3Url}${icon.key}`
            : project.faviconKeyName
            ? `${s3Url}${project.faviconKeyName}`
            : 'https://asset.drapcode.com/img/drapcode-icon-192x192.png',
          sizes: '192x192',
          type: icon ? icon.mimeType : 'image/png',
        },
      ],
      id: projectId,
      start_url: '/',
      display: 'fullscreen',
    };
    res.write(`${JSON.stringify(manifest)}`);
    res.end();
  } catch (e) {
    next(e);
  }
};

export const validateSnipcartProduct = async (req, res, next) => {
  try {
    const { db, projectId, params } = req;
    const { collectionName, itemId, itemPrice } = params;
    const snipcartPlugin = await findInstalledPlugin(projectId, pluginCode.SNIPCART);
    if (snipcartPlugin) {
      const data = await validateSnipcartItem(db, projectId, collectionName, itemId);
      if (data) {
        res.json({
          id: itemId,
          price: Number(itemPrice),
        });
      } else {
        res.status(404).json({ code: 404, message: 'Item not found with provided id' });
      }
    } else {
      res.status(404).json({ code: 404, message: 'Snipcart plugin is not installed.' });
    }
  } catch (e) {
    next(e);
  }
};
