'use strict';

// Requiring and configuring dotenv for using environment variables
require('dotenv').config();

// Node modules
const http = require('http');
const fs = require('fs');
const path = require('path');

// NPM modules
const express = require('express');
const spdy = require('spdy');
const logger = require('./lib/logger');

// Importing the services config
const integrated_services = require('./services-config');

// Importing all services
const mms = require('./services/mms');

// Initializing app
const app = express();

// Initialize httpServer and http2Server objects
let httpServer = null;
let http2Server = null;

// Set the port
app.set('port', process.env.PORT || 8000);

// Add the main route
app.get('/', function (req, res) {
    res.send({
        message: 'Dynamic Integration Service is up and running.'
    });
});

// Setting up HTTP server
if (process.env.HTTP_ENABLED === 'true') {
    httpServer = http.createServer(app);
    // Run HTTP Server
    httpServer.listen(app.get('port'), () => {
        logger.info('Dynamic Integration Service is running on ' + app.get('port'))
    });
}

// Setting up HTTP/2 (HTTPS) server
if (process.env.HTTPS_ENABLED === 'true') { 
    // setting the options
    const privateKey = fs.readFileSync(path.join(process.cwd(), process.env.SSLKEY), 'utf8');
    const certificate = fs.readFileSync(path.join(process.cwd(), process.env.SSL_CERT), 'utf8');
    const options = {
        key: privateKey,
        cert: certificate,
        protocol: ['h2'],
        honorCipherOrder: true,
        requestCert: true,
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.2'
    };
    // creating the https server
    http2Server = spdy.createServer(options, app);
    // Run HTTPS Server
    http2Server.listen(app.get('port'), () => {
        logger.info("Dynamic Integration Service is running on " + app.get('port'));
    });
}

// Publisher
const publisher = require('./pubsub/publisher');
// Subscriber
const subscriber = require('./pubsub/subscriber');

// INITIALIZING all services
const serviceClasses = {
    mms: new mms(publisher)
}

/**
 * Inital Start Function
 */
function init() {
    // Subscribe to channels
    const channels = ['AUTH_INTEGRATION'];
    // storing integrated services key to redis
    publisher.set('INTEGRATED_SERVICES', JSON.stringify(integrated_services));

    // Subscribe to channels
    subscriber.subscribe(channels, (err, count) => {
        logger.info(`Subscribed to ${count} channels`);
    });

    handleMessages();
}

function handleMessages() {
    // Listen to all messages and route to correct service
    subscriber.on('message', function(channel, message) {
        logger.info(`Receive message ${message} from channel ${channel}`);

        // Each message should have the service name in it. If not, error will be thrown
        // If service does not exist, error will be thrown
        switch(channel) {
            case 'AUTH_INTEGRATION':
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.name) {
                    serviceClasses[parsedMessage.name].handleAuth(message);
                }
                else {
                    logger.error('No property "name" for AUTH_INTEGRATION');
                }
                break;
        }
    });
}

init();
