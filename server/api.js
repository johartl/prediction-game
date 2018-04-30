const express = require('express');

const db = require('./db');

class Api {
    constructor(server) {
        this.server = server;
        this.router = express.Router();

        this.router.get('/', this.getApiInfo.bind(this));
        this.router.get('/ranking', this.getRanking.bind(this));
        this.router.get('/schedule', this.getSchedule.bind(this));
        this.router.get('/user/:id', this.getUser.bind(this));
        this.router.get('/match/:id', this.getMatch.bind(this));
    }

    getRouter() {
        return this.router;
    }

    getApiInfo(req, res) {
        res.status(200).send('Server running');
    }

    getRanking(req, res) {
        db.getRanking().then(data => res.json(data));
    }

    getSchedule(req, res) {
        db.getSchedule().then(data => res.json(data));
    }

    getUser(req, res) {
        const userId = req.params.id;
        const now = new Date();
        db.getUser(userId).then(user => {
            if (!user) {
                return res.json(null);
            }
            db.getUserTips(userId, now).then(tips => {
                res.json(Object.assign(user, {tips}));
            });
        });
    }

    getMatch(req, res) {
        const matchId = req.params.id;
        const now = new Date();
        db.getMatch(matchId).then(match => {
            if (!match) {
                return res.json(null);
            }
            if (now <= match.time) {
                return res.json(match);
            }
            db.getMatchTips(matchId).then(tips => {
                res.json(Object.assign(match, {tips}));
            })
        });
    }

}

module.exports = Api;
