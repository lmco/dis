'use strict';

const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;

// This defines our log levels
const levels = {
    critical: 0,
    error: 1,
    warn: 2,
    info: 3,
    verbose: 4,
    debug: 5
};

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
 
const logger = winston.createLogger({
  level: 'info',
  levels: levels,
  format: combine(
    label({ label: 'Dynamic Integration Service' }),
    winston.format.colorize(),
    timestamp(),
    myFormat
  ),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `info.log`
    //
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'info.log' }),
  ],
});

module.exports = logger;
