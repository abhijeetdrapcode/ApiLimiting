import express from 'express';
import { findAll } from './installedPlugin.controller';
const pluginRouter = express.Router();

pluginRouter.get('/', findAll);
export default pluginRouter;
