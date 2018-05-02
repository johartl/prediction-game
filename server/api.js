const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('./config');
const db = require('./db');

const SALT_ROUNDS = 10;

class Api {
    constructor(server) {
        this.server = server;
        this.router = express.Router();

        this.router.get('/', this.getApiInfo.bind(this));
        this.router.get('/ranking', this.getRanking.bind(this));
        this.router.get('/schedule', this.getSchedule.bind(this));
        this.router.get('/user/:id', this.getUser.bind(this));
        this.router.get('/match/:id', this.getMatch.bind(this));
        this.router.post('/login', this.postLogin.bind(this));
        this.router.post('/register', this.postRegister.bind(this));
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

    postRegister(req, res) {
        const login = req.body.login;
        const password = req.body.password;
        if (!login || !password) {
            return res.status(400).json({code: 400, error: `Missing 'login' or 'password'`});
        }
        db.getUserLogin(login).then(user => {
            if (user) {
                return res.status(400).json({code: 400, error: 'Login is already taken'});
            }
            bcrypt.hash(password, SALT_ROUNDS)
                .then(pwhash => db.insertUser(login, pwhash))
                .then(userId => res.json({login: login, id: userId}))
                .catch(error => {
                    res.status(500).json({code: 500, error: `Unable to create user account: ${error}`});
                });
        });
    }

    postLogin(req, res) {
        const login = req.body.login;
        const password = req.body.password;

        if (!login || !password) {
            return res.status(400).json({code: 400, error: `Missing 'login' or 'password'`});
        }
        db.getUserLogin(login).then(user => {
            if (!user) {
                return res.status(401).json({code: 404, error: 'User and password do not match'});
            }
            bcrypt.compare(password, user.password).then(match => {
                if (!match) {
                    return res.status(401).json({code: 404, error: 'User and password do not match'});
                }
                this.createToken(user).then(token => {
                    res.json({id: user.id, token});
                });
            });
        })
    }

    createToken(user) {
        return new Promise((resolve, reject) => {
            const payload = {id: user.id};
            jwt.sign(payload, config.jwtCertificate, config.jwtSigningOptions, (error, token) => {
                if (error) {
                    reject(error);
                }
                resolve(token);
            });
        });
    }
}

module.exports = Api;
