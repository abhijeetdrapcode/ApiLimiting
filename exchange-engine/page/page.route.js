import express from 'express';
import { createToken } from '../middleware/route.middleware';
import { authentication, localization } from '../middleware/application.middleware';
import { getFirstOptimizePage } from './page.controller';
const router = express.Router();

router.get('/:pageId?', createToken, authentication, localization, getFirstOptimizePage);
router.get(
  '/:pageId/:collectionName/:itemId?',
  createToken,
  authentication,
  localization,
  getFirstOptimizePage,
);
router.get('/:pageName/:pageId?', createToken, authentication, localization, getFirstOptimizePage);
router.get(
  '/:pageName/:pageId/:collectionName/:itemId?',
  createToken,
  authentication,
  localization,
  getFirstOptimizePage,
);

export default router;
