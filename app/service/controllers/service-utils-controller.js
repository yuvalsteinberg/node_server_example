'use strict';

const serviceUtilsManager = require('../managers/server-utils-manager');

module.exports.status = (request, response) => {
  return serviceUtilsManager.status()
  .then((result) => {
    response.status(200).json(result);
  }).catch((err) => {
    next(err);
  });
};