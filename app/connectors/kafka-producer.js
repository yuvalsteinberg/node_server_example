'use strict';
// const kafka = require('kafka-node');
const  httpStatusCodes = require('http-status-codes'),
  errorBuilder = require('../helpers/error-builder');

let producer = undefined;

module.exports.init = () => {
  // Some initialization of the kafka-producer
  // Setting `producer` to some valid object
};

module.exports.send = ({topic, message}) => {
  const payload = [
    {topic, message},
  ];

  return new Promise((resolve, reject) => {
    producer.send(payload, (err, data) => {
      if (err) {
        // log something
        const error = errorBuilder.build("KAFKA_ERROR", httpStatusCodes.INTERNAL_SERVER_ERROR, err.message);
        return reject(error);
      }

      // log something about the message
      return resolve();
    })
  });
};
