import { uploadWithNewBranch } from './githubExport.services';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
console.log('This is the github client id: ', GITHUB_CLIENT_ID);
console.log('This is the github client secret: ', GITHUB_CLIENT_SECRET);

export const uploadToGithub = async (req, res) => {
  console.log('Here the api call is being made ');
  const { githubToken, repoOwner, repoName, folderPath, mainBranch = 'main' } = req.body;

  console.log(
    'This is the data from the backend: ',
    githubToken,
    repoOwner,
    repoName,
    folderPath,
    mainBranch,
  );

  if (!githubToken || !repoOwner || !repoName || !folderPath) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const branchName = await uploadWithNewBranch(
      githubToken,
      repoOwner,
      repoName,
      folderPath,
      mainBranch,
    );

    res.json({
      message: 'Files uploaded successfully',
      branch: branchName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload files',
      details: error.message,
    });
  }
};
