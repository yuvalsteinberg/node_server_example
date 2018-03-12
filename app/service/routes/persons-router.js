'use strict';

const express = require('express'),
  personsController = require('../controllers/persons-controller');

module.exports = (app) => {
  const router = express.Router();

  router
  .get('/persons/:personId', personsController.getPerson)
  .get('/persons/:personId/children', personsController.getPersonChildren)
  .delete('/persons/:personId', personsController.deletePerson);

  app.use('/v1', router);
  return router;
};

