'use strict';

const HttpStatus = require('http-status-codes'),
  util = require('util'),
  _ = require('lodash'),
  logger = require('../../helpers/logger');

module.exports.errorMapper = (err, request, response, next) => {
  if (err.code) {
    generalError(err, err.code, request, response, next);
  } else {
    internalError(err, request, response, next);
  }
};

module.exports.notFound = (request, response, next) => {
  const error = {
    message: "No such path",
    type: "UNSUPPORTED_PATH"
  };
  returnErrorResponse(error, HttpStatus.NOT_FOUND, request, response, next);
};

const generalError = (err, httpResponseCode, request, response, next) => {
  returnErrorResponse(err, httpResponseCode, request, response, next);
};

const internalError = (err, request, response, next) => {
  request = request || {};

  logger.error(err.stack);

  if (response) {
    returnErrorResponse(err, HttpStatus.INTERNAL_SERVER_ERROR, request, response, next);
  }
};

const returnErrorResponse = (err, code, request, response, next) => {
  if (response.headersSent) {
    return next(err);
  }

  const errorMessage = err.message;
  const errorBody = {
    code: util.format("%s - %s", code, HttpStatus.getStatusText(code)),
    type: err.type,
    details: errorMessage && _.castArray(errorMessage)
  };

  return response.status(code).json(errorBody);
};
