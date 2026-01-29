import express from 'express';
import {
  getManifestJson,
  getRobotsTxt,
  getSitemapXml,
  validateSnipcartProduct,
} from './seo.controller';
const router = express.Router();

router.get('/robots.txt', getRobotsTxt);
router.get('/sitemap.xml', getSitemapXml);
router.get('/manifest.webmanifest.json', getManifestJson);

// Product validation for Snipcart
router.get('/:collectionName/:itemId/:itemPrice/validate-product.json', validateSnipcartProduct);

export default router;
