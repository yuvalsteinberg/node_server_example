'use strict';

const util = require('util'),
  HttpStatus = require('http-status-codes'),
  personsConnector = require('../connectors/persons-connector'),
  logger = require('../helpers/logger'),
  errorBuilder = require('../helpers/error-builder');

const ERROR_MAPPING = {
  [HttpStatus.NOT_FOUND]: {
    code: HttpStatus.NOT_FOUND,
    message: "person not found"
  }
};
const defaultError = {
  code: HttpStatus.INTERNAL_SERVER_ERROR,
  message: "Unexpected error"
};

module.exports.getPerson = (personId, requestId) => {
  return extractPerson(personId, requestId)
  .catch((error) => {
    logger.error("Failed to get a person", error);
    return Promise.reject(buildError("GET_PERSON", error));
  });
};


module.exports.deletePerson = (personId, requestId) => {
  return deletePerson(personId, requestId)
  .catch((error) => {
    logger.error("Failed to get a person", error);
    return Promise.reject(buildError("DELETE_PERSON", error));
  });
};


const extractPerson = (personId, requestId) => {
  const data = {
    method: "GET",
    serviceUrl: util.format("v1/persons/%s", personId),
    headers: basicHeaders(requestId)
  };

  return personsConnector.execute(data)
  .then((result) => ({
      personId: result.person_id,
      name: result.name,
      children: result.children
    })
  );
};

const deletePerson = (personId, requestId) => {
  const data = {
    method: "DELETE",
    serviceUrl: util.format("v2/persons/%s", personId),
    headers: basicHeaders(requestId)
  };

  return personsConnector.execute(data)
  .then((result) => {});
};

const basicHeaders = (requestId) => ({requestId});

const buildError = (type, error) => {
  const errorData = ERROR_MAPPING[error.code] || defaultError;

  return errorBuilder.build(type, errorData.code, errorData.message);
};