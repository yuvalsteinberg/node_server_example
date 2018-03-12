'use strict';
const _ = require('lodash'),
  logger = require('../../helpers/logger'),
  personModel = require('../../models/person'),
  personKafkaNotifications = require('../../models/person-kafka-notifications');

module.exports.getPerson = (personId, requestId) => {
  return personModel.getPerson(personId, requestId)
  .catch((error) => {
    logger.error("Failed to get a person", error);
    return Promise.reject(error);
  });
};

module.exports.getPersonChildren = (personId, requestId) => {
  return personModel.getPerson(personId, requestId)
  .then((person) => {
    return getChildren(person, requestId);
  }).catch((error) => {
    logger.error("Failed to get a person's children", error);
    return Promise.reject(error);
  });
};

module.exports.deletePerson = (personId, requestId) => {
  return personModel.deletePerson(personId, requestId)
  .then(() => notifyDeletion(personId, requestId))
  .then(emptyResponse)
  .catch((error) => {
    logger.error("Failed to delete a person", error);
    return Promise.reject(error);
  });
};

const getChildren = (person, requestId) => {
  const childrenPromises = _
  .chain(person.children)
  .map((childId) => personModel.getPerson(childId, requestId))
  .value();

  return Promise.all(childrenPromises);
};

const notifyDeletion = (personId, requestId) => {
  return personKafkaNotifications.notifyDeletion(personId, requestId)
  .catch((error) => {
    logger.error({personId, requestId}, "Failed to send delete notification for message with error %j", error);
    return Promise.resolve(); // Do not fail
  });
};

const emptyResponse = () => (Promise.resolve());
