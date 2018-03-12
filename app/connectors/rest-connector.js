'use strict';
const request = require('request-promise'),
  _ = require('lodash'),
  logger = require('../helpers/logger');

module.exports.execute = ({method, url, body, headers, queryString, timeout, requestId}) => {
  return request[_.toLower(method)]({
    uri: url,
    body: body,
    headers: headers,
    qs: queryString,
    json: true,
    timeout: timeout
  }).catch((error) => {
    logger.error({requestId, error}, "Failed with request to %s", url);
    return Promise.reject(error);
  });
};
