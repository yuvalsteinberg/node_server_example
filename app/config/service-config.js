'use strict';

module.exports = {
  port: process.env.PORT || 3000,
  environment: process.env.ENVIRONMENT,
  logLevel: process.env.LOG_LEVEL || 'info',
};
