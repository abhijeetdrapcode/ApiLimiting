import express from 'express';
import { sendForEsign, fetchEnvelopeDetails, fetchSigningStatus } from './docusign.controller';

const docusignRouter = express.Router();

docusignRouter.post('/send-for-esign/', sendForEsign);
docusignRouter.post('/fetch-envelope-details', fetchEnvelopeDetails);
docusignRouter.post('/fetch-signers-signing-status', fetchSigningStatus);

export default docusignRouter;
