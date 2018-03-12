'use strict';
// const kafka = require('kafka-node');
const httpStatusCodes = require('http-status-codes'),
  errorBuilder = require('../helpers/error-builder'),
  logger = require('../helpers/logger');

let producer = undefined;

module.exports.init = () => {
  // Some initialization of the kafka-producer
  // Setting `producer` to some valid object
};

module.exports.send = ({topic, message, requestId}) => {
  const payload = [
    {topic, message},
  ];

  return new Promise((resolve, reject) => {
    producer.send(payload, (error, data) => {
      if (error) {
        logger.error({requestId, topic}, "Failed to push message to kafka: %j", error);

        const returnError = errorBuilder.build("KAFKA_ERROR", httpStatusCodes.INTERNAL_SERVER_ERROR, error.message);
        return reject(returnError);
      }

      // log something about the message
      return resolve();
    })
  });
};
