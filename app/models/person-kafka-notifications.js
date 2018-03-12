'use strict';
const httpStatusCodes = require('http-status-codes'),
  logger = require('../helpers/logger'),
  errorBuilder = require('../helpers/error-builder'),
  config = require('../config/persons-config'),
  kafkaProducer = require('../connectors/kafka-producer');

module.exports.notifyDeletion = (personId, requestId) => {
  const data = {
    topic: config.kafkaDeleteNotificationTopic,
    message: {
      personId,
      requestId
    }
  };
  return kafkaProducer.send(data)
  .then(() => {})
  .catch((error) => {
    logger.error("Failed to send notification: %j", error);

    const rejectError = errorBuilder.build("KAFKA_NOTIFICATION_DELETE_PERSON", httpStatusCodes.INTERNAL_SERVER_ERROR, error.message);
    return Promise.reject(rejectError);
  });
};
