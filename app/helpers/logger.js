'use strict';

const bunyan = require('bunyan'),
    config = require('../config/service-config');

const logger = bunyan.createLogger({
    name: 'Example Service',
    src: true,
    env: {
        instance: config.instanceName
    },
    streams: [
        {
            level: config.logLevel,
            stream: process.stdout
        },
        {
            level: 'error',
            stream: process.stderr
        }
    ]
});

module.exports = logger;
