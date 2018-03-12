'use strict';

const _ = require('lodash'),
  mung = require('express-mung'),
  util = require('util'),
  logger = require('../../helpers/logger');


const postHandle = (body, request, response) => {
  _.merge(request.info, responseData(body, request, response));
  logger.info(request.info, "End handling request: [%s: %s], response code: %s", request.info.request.method, request.info.request.serviceUrl, request.info.response.statusCode);

  return Promise.resolve(body);
};

const responseData = (body, request, response) => {
  const endTime = new Date();
  return {
    response: {
      statusCode: response.statusCode,
      body: body
    },
    endTime: endTime,
    duration: endTime - request.info.startTime
  };
};

module.exports.preHandle = (request, response, next) => {
  _.merge(request, {
    info: requestData(request)
  });

  logger.info(request.info, "Begin handling request: [%s: %s]", request.method, request.originalUrl);
  next();
};

module.exports.postHandle = mung.jsonAsync(postHandle, {mungError: true});

const requestData = (request) => {
  return {
    request: {
      method: request.method,
      serviceUrl: request.originalUrl,
      body: JSON.stringify(request.body),
    },
    startTime: new Date()
  };
};

