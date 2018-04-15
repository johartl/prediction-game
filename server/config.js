const path = require('path');

module.exports = {
    listenHost: '127.0.0.1',
    listenPort: 8080,
    dbConnection: 'dbname=tip',
    logLevel: 'info',
    logFile: path.resolve(__dirname, '../log/server.log'),
    logColorize: false
};
