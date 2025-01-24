import express from 'express';
import { uploadToGithub } from './githubExport.controller';

const githubRouter = express.Router();

githubRouter.post('/github-upload', uploadToGithub);

export default githubRouter;
