'use strict';

const serviceUtilsManager = require('../managers/server-utils-manager'),
  HttpStatus = require('http-status-codes');

module.exports.status = (request, response) => {
  return serviceUtilsManager.status()
  .then((result) => {
    response.status(HttpStatus.OK).json(result);
  }).catch((err) => {
    next(err);
  });
};