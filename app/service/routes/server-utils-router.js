'use strict';

const express = require('express'),
  serviceUtilsController = require('../controllers/service-utils-controller');

module.exports = (app) => {
  const router = express.Router();

  router.use('/status', serviceUtilsController.status);

  app.use('/', router);
  return router;
};

