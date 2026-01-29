import assistantApiRouter from '../ai-assistant/assistant.route';
import auditLogRouter from '../logs/audit/audit.route';
import bngPaymentRouter from '../bng-payment/bngPayment.route';
import boxRouter from '../box/box.route';
import chatbotMessageRouter from '../messaging/chatbot/chatbot.route';
import cibilRouter from '../cibil/cibil.route';
import codeExportRouter from '../project/code/codeExport.route';
import collectionFormRoute from '../collection-form/collectionForm.route';
import collectionFormOpenRoute from '../collection-form/collectionFormOpen.route';
import collectionTableRoute from '../collection-table/collectionTable.route';
import collectionRouter from '../collection/collection.route';
import customComponentRoute from '../custom-component/customComponent.route';
import customDataMappingRoute from '../custom-mapping/customMapping.route';
import customFunctionRoute from '../custom-function/customFunction.route';
import docusignRouter from '../docusign/docusign.route';
import dumpRouter from '../db-dump/dump.routes';
import emailRouter from '../email/email.route';
import eventRouter from '../event/event.route';
import externalApiRouter from '../external-api/external-api.route';
import externalApiMiddlewareRoute from '../external-api-middleware/external.api.mddleware.route';
import fluidPayRouter from '../fluid-pay/fluid-pay.route';
import githubPublishRoute from '../github-publish/githubPublish.route';
import googleRouter from '../google/google.route';
import imaginePayRouter from '../imagine-pay/imaginePay.route';
import indexRouter from '../indexes/indexes.routes';
import itemRouter from '../item/item.route';
import loanRouter from '../loan/loan.route';
import loginPluginRoute from '../loginPlugin/loginPlugin.route';
import messageRouter from '../messaging/message.route';
import metaDataMappingRouter from '../meta-data-mapping/metaDataMapping.route';
import ocrToTextRoute from '../ocr-to-text/ocrToText.route';
import pineconeRouter from '../pinecone/pinecone.route';
import plaidRouter from '../plaid/plaid.route';
import pluginRouter from '../install-plugin/installedPlugin.route';
import projectRouter from '../project/project.route';
import profilerRouter from '../profiling/profiler.routes';
import qrRouter from '../qr/qr.route';
import scheduleRouter from '../schedules/schedule.route';
import smsRouter from '../sms/sms.route';
import signzyRouter from '../signzy/signzy.route';
import socketIoRouter from '../socket-io/socketIO.route';
import stripeConnectRouter from '../stripe-connect/stripeConnect.route';
import stripePaymentMethodsRouter from '../stripe-payment-methods/stripePaymentMethod.route';
import typesenseSearchRouter from '../typesense-search/typesenseSearch.route';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import userConsentOTPRouter from '../user-consent-otp/userConsentOTP.route';
import uploadRoute from '../upload-api/upload.route';
import { v1Router, v2Router } from '../developer/index.route';
import webhookRoute from '../webhooks/webhook.route';
import zoomRouter from '../zoom/zoom.route';

import mPesaRouter from '../m-pesa/mPesa.route';
import spinMobileRouter from '../spin-mobile/spinMobile.route';

import {
  ASSISTANT_ROUTE,
  AUDIT_LOGS_API,
  AUTH_ROUTE,
  BNG_PAYMENT_ROUTE,
  BOX_ROUTE,
  CHATBOT_MESSAGE_API,
  CIBIL_ROUTE,
  CODE_EXPORT,
  COLLECTION_DETAIL_ROUTE,
  COLLECTION_FORM_AUTH,
  COLLECTION_FORM_OPEN,
  COLLECTION_ITEMS_ROUTE,
  CUSTOM_COMPONENT_ROUTE,
  CUSTOM_FUNCTION_ROUTE,
  DOCUSIGN_ROUTE,
  DUMP_API,
  EMAIL_ROUTE,
  EVENT_ROUTE,
  EXTERNAL_API_MIDDLEWARE_ROUTE,
  EXTERNAL_API_ROUTE,
  FLUID_PAY_ROUTE,
  GITHUB_PUBLISH_ROUTE,
  GOOGLE_ROUTE,
  IMAGINE_PAY_ROUTE,
  INDEX_API,
  ITEM_ROUTE,
  LOAN_ROUTE,
  MESSAGE_API,
  META_DATA_MAPPING_ROUTE,
  OCR_TO_TEXT_ROUTE,
  PINECONE_ROUTE,
  PLAID_ROUTE,
  PLUGIN_ROUTE,
  PROFILER_API,
  PROJECT_ROUTE,
  QR_ROUTE,
  SCHEDULER_API,
  SIGNZY_ROUTE,
  SMS_ROUTE,
  SOCKET_IO_ROUTE,
  STRIPE_CONNECT_ROUTE,
  STRIPE_PAYMENT_METHODS,
  TYPESENSE_SEARCH_ROUTE,
  UPLOAD_ROUTE,
  USER_CONSENT_OTP_ROUTE,
  WEBHOOK_ROUTE,
  ZOOM_ROUTE,
  MPESA_ROUTE,
  SPIN_MOBILE_ROUTE,
  CUSTOM_DATA_MAPPING_ROUTE,
} from './constants';
import applicationRouter from '../application/application.route';
import { verifyJwt, verifyJwtForOpen } from '../middleware/verifyJWTToken.middleware';

export const registerRoutes = (app) => {
  app.use(DUMP_API, dumpRouter);
  app.use(INDEX_API, indexRouter);
  app.use(PROJECT_ROUTE, projectRouter);
  app.use(AUDIT_LOGS_API, auditLogRouter);
  app.use(CODE_EXPORT, codeExportRouter);
  app.use(AUTH_ROUTE, loginPluginRoute);
  app.use(EVENT_ROUTE, eventRouter);
  app.use(EMAIL_ROUTE, verifyJwtForOpen, tenantMiddleware, emailRouter);
  app.use(ITEM_ROUTE, itemRouter); //Remain
  app.use(COLLECTION_ITEMS_ROUTE, tenantMiddleware, collectionTableRoute);
  app.use(EXTERNAL_API_ROUTE, verifyJwtForOpen, tenantMiddleware, externalApiRouter);
  app.use(UPLOAD_ROUTE, uploadRoute);
  app.use(COLLECTION_DETAIL_ROUTE, collectionRouter);
  app.use(EXTERNAL_API_MIDDLEWARE_ROUTE, externalApiMiddlewareRoute);
  app.use(STRIPE_CONNECT_ROUTE, stripeConnectRouter);
  app.use(BNG_PAYMENT_ROUTE, bngPaymentRouter);
  app.use(IMAGINE_PAY_ROUTE, imaginePayRouter);
  app.use(WEBHOOK_ROUTE, webhookRoute);
  app.use('/api/v1/developer', tenantMiddleware, v1Router);
  app.use('/api/v2/developer', tenantMiddleware, v2Router);
  app.use(PLUGIN_ROUTE, pluginRouter);
  app.use(CUSTOM_COMPONENT_ROUTE, customComponentRoute);
  app.use(CUSTOM_DATA_MAPPING_ROUTE, verifyJwtForOpen, tenantMiddleware, customDataMappingRoute);
  app.use(CUSTOM_FUNCTION_ROUTE, customFunctionRoute);
  app.use(PROFILER_API, profilerRouter);
  app.use(SCHEDULER_API, scheduleRouter);
  app.use(OCR_TO_TEXT_ROUTE, ocrToTextRoute);
  app.use(DOCUSIGN_ROUTE, verifyJwtForOpen, tenantMiddleware, docusignRouter);
  app.use(GITHUB_PUBLISH_ROUTE, githubPublishRoute);
  app.use(PINECONE_ROUTE, verifyJwt, tenantMiddleware, pineconeRouter);
  /*
  Above this will be public API(not authenticated)
  Below this all will be authenticated
  */
  app.use(STRIPE_PAYMENT_METHODS, verifyJwtForOpen, tenantMiddleware, stripePaymentMethodsRouter);
  app.use(COLLECTION_FORM_OPEN, verifyJwtForOpen, tenantMiddleware, collectionFormOpenRoute);
  app.use(FLUID_PAY_ROUTE, verifyJwtForOpen, tenantMiddleware, fluidPayRouter);
  app.use(CHATBOT_MESSAGE_API, verifyJwtForOpen, tenantMiddleware, chatbotMessageRouter);
  app.use(COLLECTION_FORM_AUTH, verifyJwt, tenantMiddleware, collectionFormRoute);
  app.use(PLAID_ROUTE, verifyJwt, tenantMiddleware, plaidRouter);
  app.use(MESSAGE_API, verifyJwt, messageRouter);
  app.use(SMS_ROUTE, verifyJwtForOpen, tenantMiddleware, smsRouter);
  app.use(ASSISTANT_ROUTE, verifyJwtForOpen, tenantMiddleware, assistantApiRouter);
  app.use(LOAN_ROUTE, verifyJwtForOpen, tenantMiddleware, loanRouter);
  app.use(USER_CONSENT_OTP_ROUTE, verifyJwtForOpen, tenantMiddleware, userConsentOTPRouter);
  app.use(TYPESENSE_SEARCH_ROUTE, verifyJwtForOpen, tenantMiddleware, typesenseSearchRouter);
  app.use(META_DATA_MAPPING_ROUTE, verifyJwtForOpen, tenantMiddleware, metaDataMappingRouter);
  app.use(SOCKET_IO_ROUTE, verifyJwtForOpen, tenantMiddleware, socketIoRouter);
  app.use(SIGNZY_ROUTE, verifyJwtForOpen, tenantMiddleware, signzyRouter);
  app.use(GOOGLE_ROUTE, verifyJwtForOpen, tenantMiddleware, googleRouter);
  app.use(ZOOM_ROUTE, verifyJwtForOpen, tenantMiddleware, zoomRouter);
  app.use(CIBIL_ROUTE, verifyJwtForOpen, tenantMiddleware, cibilRouter);
  app.use(BOX_ROUTE, verifyJwtForOpen, tenantMiddleware, boxRouter);
  app.use(QR_ROUTE, verifyJwtForOpen, tenantMiddleware, qrRouter);
  app.use(MPESA_ROUTE, verifyJwtForOpen, tenantMiddleware, mPesaRouter);
  app.use(SPIN_MOBILE_ROUTE, verifyJwtForOpen, tenantMiddleware, spinMobileRouter);

  app.use('/', applicationRouter);
};
