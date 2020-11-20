'use strict';

// Import Redis
const Redis = require('ioredis');
const logger = require('../lib/logger');

// Publisher Instance
const publisher = new Redis({
    port: process.env.REDIS_PORT, // Redis port
    host: process.env.REDIS_HOST, // Redis host
    db: process.env.REDIS_DB
});

publisher.on('connect', () => {
    logger.info('Redis Publisher successfully connected');
});

publisher.on('end', () => {
    logger.err('Redis disconnected');
});

publisher.on('error', (err) => {
    logger.err('Redis error: ', err);
});

publisher.on('reconnecting', () => {
    logger.info('Reconnecting Redis');
});

// Exporting the publisher
module.exports = publisher;
