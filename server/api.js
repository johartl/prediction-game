const express = require('express');

class Api {
    constructor(server) {
        this.server = server;
        this.router = express.Router();

        this.router.get('/', this.getApiInfo.bind(this));
    }

    getRouter() {
        return this.router;
    }

    getApiInfo(req, res) {
        res.status(200).send('Server running');
    }
}

module.exports = Api;
