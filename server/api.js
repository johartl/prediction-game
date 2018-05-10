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

        // Authentication required
        const auth = this.authenticationMiddleware.bind(this);
        this.router.get('/', this.getApiInfo.bind(this));
        this.router.get('/ranking', auth, this.getRanking.bind(this));
        this.router.get('/schedule', auth, this.getSchedule.bind(this));
        this.router.get('/user/:id', auth, this.getUser.bind(this));
        this.router.get('/match/:id', auth, this.getMatch.bind(this));
        this.router.get('/auth', auth, this.getAuth.bind(this));

        // No authentication required
        this.router.post('/login', this.postLogin.bind(this));
        this.router.post('/register', this.postRegister.bind(this));
    }

    getRouter() {
        return this.router;
    }

    authenticationMiddleware(req, res, next) {
        const token = req.header('X-AUTH-TOKEN');
        if (!token) {
            return res.status(401).json({code: 401, error: 'Not authorized'});
        }
        this.verifyToken(token)
            .then(({id}) => db.getUser(id))
            .then(user => {
                req.auth = user;
                next();
            })
            .catch(() => {
                res.status(401).json({code: 401, error: 'Not authorized'});
            });
    }

    getApiInfo(req, res) {
        res.status(200).send('API running');
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
            });
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

    getAuth(req, res) {
        this.signToken(req.auth.id).then(token => {
            res.json({user: req.auth, token});
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
                this.signToken(user.id).then(token => {
                    res.json({user, token});
                });
            });
        });
    }

    signToken(userId) {
        return new Promise((resolve, reject) => {
            const payload = {id: userId};
            jwt.sign(payload, config.jwtCertificate, config.jwtOptions, (error, token) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            });
        });
    }

    verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.jwtCertificate, config.jwtOptions, (error, decoded) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(decoded);
                }
            });
        });
    }
}

module.exports = Api;
