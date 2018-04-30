const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const fallback = require('express-history-api-fallback');
const path = require('path');

const config = require('./config');
const logger = require('./logger');
const Api = require('./api');
const db = require('./db');

const appRoot = path.resolve(__dirname, '..', 'app');
const staticFilesDir = path.resolve(appRoot, 'dist');

class Server {
    constructor() {
        this.app = express();
        this.server = null;
        this.globalSocketId = 0;
        this.sockets = new Map();

        // Set up request logging
        const logStream = {
            write: (message, encoding) => logger.debug(message)
        };
        const requestLogger = morgan('common', {stream: logStream});
        this.app.use(requestLogger);

        // Enable gzip compression
        this.app.use(compression());

        // Parse JSON body
        this.app.use(bodyParser.json());

        this.api = new Api(this);
        this.app.use('/api', this.api.getRouter());

        this.app.use('/', express.static(staticFilesDir));
        this.app.use(fallback(path.resolve(staticFilesDir, 'index.html')));
    }

    init() {
        return db.connect().then(() => logger.info('Connected to database'));
    }

    start() {
        if (this.server) {
            console.warn('Requested to start server but server is already running');
        }
        logger.info('Starting server');
        this.init().then(() => {
            this.server = this.app.listen(config.listenPort, config.listenHost, () => {
                logger.info(`Server listening on ${config.listenHost}:${config.listenPort}`)
            });

            // Keep track of open connections
            this.server.on('connection', (socket) => {
                const socketId = this.globalSocketId++;
                this.sockets.set(socketId, socket);

                // Remove connection after it has been closed
                socket.on('close', () => this.sockets.delete(socketId));
            });

            const STOP_SIGNALS = ['SIGHUP', 'SIGINT', 'SIGTERM'];
            STOP_SIGNALS.forEach(signal => process.on(signal, () => {
                logger.info(`Received ${signal} signal`);
                this.stop();
            }));

        }).catch(() => {
            logger.error('Failed to start server - Killing process now');
            process.exit(1);
        });
    }

    stop() {
        if (!this.server) {
            logger.warn('Requested to stop server but server is not running');
            return;
        }
        logger.info('Stopping server');

        // Close all open connections
        this.sockets.forEach(socket => socket.destroy());
        this.sockets.clear();

        this.server.close(error => {
            clearTimeout(killServerTimeout);
            if (error) {
                logger.error(`Error while stopping server (${error}) - Killing process now`);
                process.exit(1);
            } else {
                this.server = null;
                logger.info('Server was stopped');
                process.exit(0);
            }
        });

        // Kill server after 3 seconds
        const killServerTimeout = setTimeout(() => {
            logger.error('Unable to gracefully stop server within timeout - Killing process now');
            process.exit(1);
        }, 3000);
    }
}

module.exports = Server;
