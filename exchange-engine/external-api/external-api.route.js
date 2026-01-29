import express from 'express';
import {
  sendDataOnExternalApi,
  callExternalApiAndProcess,
  findApiById,
  traceError,
  processDataFromResponseJSON,
  processAPIRequest,
} from './external-api.controller';

const externalApiRouter = express.Router();

externalApiRouter.post('/send-webhook/', sendDataOnExternalApi);
externalApiRouter.post('/:collectionItemId?', callExternalApiAndProcess);
externalApiRouter.post('/process/response-data/', processDataFromResponseJSON);
externalApiRouter.get('/id/:externalApiId', findApiById); //Usage?
externalApiRouter.get('/traceError/', traceError);

externalApiRouter.post('/mock-data/rest-api/', processAPIRequest);

export default externalApiRouter;
