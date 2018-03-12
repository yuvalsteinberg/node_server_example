'use strict';

module.exports = {
  serviceUrl: process.env.PERSONS_SERVICE_URL,
  serviceRequestTimeout: (process.env.PERSONS_SERVICE_REQUEST_TIMEOUT_SEC || 2) * 1000,

  kafkaDeleteNotificationTopic: process.env.PERSONS_DELETE_NOTIFICATION_KAFKA_TOPIC,
};
