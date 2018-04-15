#!/usr/bin/env node
const ArgumentParser = require('argparse').ArgumentParser;
const fs = require('fs');
const path = require('path');

const config = require('./config');

const parser = ArgumentParser({
    description: 'Tip match server',
    addHelp: true
});
parser.addArgument(['-c', '--config'], {
    help: 'Apply config override'
});

const args = parser.parseArgs();

// Apply config override
if (args.config) {
    const configOverride = path.resolve(args.config);
    if (!fs.existsSync(configOverride)) {
        const logger = require('./logger');
        logger.error(`Config override file '${configOverride}' does not exist`);
        process.exit(1);
    }
    Object.assign(config, require(configOverride));
}

// Import server module only after overriding config
const Server = require('./server');
const server = new Server();
server.start();
