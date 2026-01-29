import express from 'express';
import { proxyImages } from './proxy.controller';
const router = express.Router();

router.post('/proxy-images', proxyImages);

export default router;
