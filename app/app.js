'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  // httpShutdown = require('http-shutdown'),

  serviceConfig = require('./config/service-config.js'),
  logger = require('./helpers/logger'),
  requestLogging = require('./service/middlewares/request-logging'),
  errorHandler = require('./service/middlewares/error-handler'),
  serviceUtilsRouter = require('./service/routes/server-utils-router'),
  personsRouter = require('./service/routes/persons-router')
  ;

// initializations
require('./connectors/kafka-producer').init();

// Prepare the express application
const app = express();
app.use(bodyParser.json());
serviceUtilsRouter(app);  // Before pre & post handle to avoid logging

app.use(requestLogging.preHandle);
app.use(requestLogging.postHandle);
personsRouter(app);

// Error handling
app.use(errorHandler.notFound);
app.use(errorHandler.errorMapper);

// disable Express header
app.disable('x-powered-by');

let server = app.listen(serviceConfig.port, () => {
  logger.info('Start listening on port %d', serviceConfig.port);
});
// server = httpShutdown(server);


module.exports = app;   // Export the app for testing