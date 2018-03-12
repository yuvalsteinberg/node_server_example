'use strict';

const personsManager = require('../managers/persons-manager'),
  HttpStatus = require('http-status-codes');

module.exports.getPerson = (request, response, next) => {
  return personsManager.getPerson(personId(request), requestId(request))
  .then((result) => {
    response.status(HttpStatus.OK).json(result);
  }).catch((err) => {
    next(err);
  });
};

module.exports.getPersonChildren = (request, response, next) => {
  return personsManager.getPersonChildren(personId(request), requestId(request))
  .then((result) => {
    response.status(HttpStatus.OK).json(result);
  }).catch((err) => {
    next(err);
  });
};

module.exports.deletePerson = (request, response, next) => {
  return personsManager.deletePerson(personId(request), requestId(request))
  .then((result) => {
    response.status(HttpStatus.OK).json(result);
  }).catch((err) => {

    next(err);
  });
};

const personId = (request) => (request.params.personId);
const requestId = (request) => (request.headers.requestId);
