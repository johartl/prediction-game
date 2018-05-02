const path = require('path');
const fs = require('fs');

module.exports = {
    listenHost: '127.0.0.1',
    listenPort: 8080,
    logLevel: 'info',
    logFile: path.resolve(__dirname, '../log/server.log'),
    logColorize: false,
    dbConnection: {
        user: 'tip',
        host: 'localhost',
        database: 'tip',
        password: 'pleasedonttellanyone',
        port: 3211
    },
    jwtSigningOptions: {
        algorithm: 'HS256',
        expiresIn: '24h',
    },
    jwtCertificate: fs.readFileSync(path.resolve(__dirname, 'jwt.key'))
};
