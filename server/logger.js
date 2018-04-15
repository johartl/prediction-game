const winston = require('winston');

const config = require('./config');

let transports = [];

transports.push(new winston.transports.Console({
    level: config.logLevel,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false,
    timestamp: true,
    colorize: config.logColorize
}));

if (config.logFile) {
    transports.push(new (winston.transports.File)({
        filename: config.logFile,
        level: config.logLevel,
        colorize: false,
        json: false
    }));
}

const logger = new winston.Logger({
    transports: transports
});

module.exports = logger;
