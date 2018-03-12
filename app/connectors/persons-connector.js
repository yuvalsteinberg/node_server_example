'use strict';
const util = require('util'),
  restConnector = require('./rest-connector'),
  personConfig = require('../config/persons-config');

module.exports.execute = ({method, path, body, headers, queryString, requestId}) => {
  return restConnector.execute({
    method,
    url: util.format("%s/%s", personConfig.serviceUrl, path),
    body,
    headers,
    queryString,
    requestId,
    timeout: personConfig.serviceRequestTimeout
  });
};
