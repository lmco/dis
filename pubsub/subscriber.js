'use strict';

// Import Redis
const Redis = require('ioredis');
const logger = require('../lib/logger');

// Subscriber Instance
const subscriber = new Redis({
    port: process.env.REDIS_PORT, // Redis port
    host: process.env.REDIS_HOST, // Redis host
    db: process.env.REDIS_DB
});

subscriber.on('connect', () => {
    logger.info('Redis Subscriber successfully connected');
});

subscriber.on('end', () => {
    logger.error('Redis Subscriber disconnected');
});

subscriber.on('error', (err) => {
    logger.error('Redis Subscriber error: ', err);
});

subscriber.on('reconnecting', () => {
    logger.info('Reconnecting Redis Subscriber');
});

// Exporting the subscriber
module.exports = subscriber;
