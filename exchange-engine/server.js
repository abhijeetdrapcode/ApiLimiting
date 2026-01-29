import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { errorLogger } from 'drapcode-utility';
import { redisClient } from 'drapcode-redis';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

import { DOCS_API, LOGS_API } from './routes/constants';
import dbConnection from './config/database';

import { swaggerMiddleware } from './middleware/swagger.middleware';
import { closeAllConnections } from './config/mongoUtil';
import { setupSocketWithRedis } from './socket-io/socketManager';
import { xssSanitizer } from './middleware/sanitizer.middleware';
import { requestLogger } from './middleware/request.middleware';
import passport from './security/passport.config';
import { registerRoutes } from './routes';
import { initRedisSession } from './security/initRedisSession';

const APP_PORT = process.env.APP_PORT || 5001;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 6003;

const app = express();
//Socket Handling
// app.set('trust proxy', true);
const server = createServer(app);
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

global.io = io;
setupSocketWithRedis(io);
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

const ENABLE_COMPRESSION = process.env.ENABLE_COMPRESSION === 'true';
if (ENABLE_COMPRESSION) {
  app.use(compression());
} else {
  // eslint-disable-next-line no-unused-vars
  app.use(compression({ filter: (req, res) => false }));
}

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'jsessionid'],
};

app.use(cors(corsOptions));

let options = {
  maxAge: '60m',
  etag: false,
};
app.use(['/resources', '/'], express.static('public', options));
app.use('/static', express.static(`${process.env.BUILD_FOLDER}views`)); //To load Custom CSS File
app.use('/serviceWorker.js', express.static(path.join(__dirname, 'public/serviceWorker.js'))); // To load Service Worker
app.set('views', `${process.env.BUILD_FOLDER}views`);
app.set('view engine', 'hbs');
app.use(requestLogger);
initRedisSession(app);
app.use(passport.initialize());
app.use(passport.session());


app.use(dbConnection);
app.use(DOCS_API, swaggerUi.serve, swaggerMiddleware, swaggerUi.setup(null, { explorer: true }));

// app.use(DOCS_API, swaggerUi.serve, swaggerMiddleware, (req, res) => {
//   swaggerUi.setup(req.swaggerSpec, { explorer: true })(req, res);
// });
// Cleaning xss value
app.use(xssSanitizer);
registerRoutes(app);
app.use(errorLogger);

app.listen(APP_PORT, () => {
  console.log(`Server is listening on port ${APP_PORT}`);
});

server.listen(WEBSOCKET_PORT, () => {
  console.log(`Websockets Server is listening on port ${WEBSOCKET_PORT}`);
});

mongoose.connection.on('error', (err) => {
  console.error('********** $$$$$$ ********');
  console.error('Connection Broke from Database');
  console.error('Connection Err :>> ', err);
  process.exit(1);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  console.error('Stack Trace:', reason?.stack);
});

// Gracefully handle process termination
process.on('SIGINT', async () => {
  console.log('SIGINT received: Closing MongoDB connections...');
  await closeAllConnections(); // Close DB connections
  await redisClient.quit();
  io.close();
  process.exit(0); // Exit process
});
