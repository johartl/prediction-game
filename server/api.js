const express = require('express');

class Api {
    constructor(server) {
        this.server = server;
        this.router = express.Router();
    }

    getRouter() {
        return this.router;
    }
}

module.exports = Api;
