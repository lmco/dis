'use strict';

// Import Redis
const Redis = require('ioredis');

// Subscriber Instance
const subscriber = new Redis({
    port: process.env.REDIS_PORT, // Redis port
    host: process.env.REDIS_HOST, // Redis host
    db: process.env.REDIS_DB
});

// Exporting the subscriber
module.exports = subscriber;
