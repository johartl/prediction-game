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
        this.matches = new Map();

        const auth = this.authenticationMiddleware.bind(this);

        // Authentication required
        this.router.get('/ranking', auth(), this.getRanking.bind(this));
        this.router.get('/schedule', auth(), this.getSchedule.bind(this));
        this.router.get('/profile', auth(), this.getProfile.bind(this));
        this.router.get('/profile/:id?', auth(), this.getProfile.bind(this));
        this.router.put('/predictions', auth(), this.savePredictions.bind(this));
        this.router.get('/predictions/:id?', auth(), this.getPredictions.bind(this));
        this.router.get('/match/:id', auth(), this.getMatch.bind(this));
        this.router.get('/auth', auth(), this.getAuth.bind(this));
        this.router.get('/teams', auth(), this.getTeams.bind(this));

        // Special authorization required
        this.router.put('/match/:id/result', auth(['admin']), this.saveMatchResult.bind(this));

        // No authentication required
        this.router.get('/', auth(), this.getApiInfo.bind(this));
        this.router.post('/login', this.login.bind(this));
        this.router.post('/register', this.register.bind(this));
    }

    getRouter() {
        return this.router;
    }

    authenticationMiddleware(requiredRoles = []) {
        return (req, res, next) => {
            const token = req.header('X-AUTH-TOKEN');
            if (!token) {
                return res.status(401).json({code: 401, error: 'Not authenticated'});
            }
            this.verifyToken(token)
                .then(({id}) => db.getUser(id))
                .then(user => {
                    if (requiredRoles.some(role => !user.roles.includes(role))) {
                        return res.status(401).json({code: 401, error: `Not authorized (required roles: ${requiredRoles.join(' ')}`});
                    }
                    req.auth = user;
                    next();
                })
                .catch(() => {
                    res.status(401).json({code: 401, error: 'Error in authentication'});
                });
        };
    }

    initialize() {
        return this.loadMatches();
    }

    loadMatches() {
        return new Promise((resolve, reject) => {
            db.getSchedule().then(matches => {
                this.matches.clear();
                matches.forEach(match => this.matches.set(match.id, match));
                this.firstMatchTime = Math.min(...matches.map(match => match.time));
                resolve();
            });
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

    getProfile(req, res) {
        const userId = req.params.id || req.auth.id;
        db.getProfile(userId).then(profile => res.json(profile));
    }

    getPredictions(req, res) {
        const userId = req.params.id || req.auth.id;
        const now = new Date();
        const championPredictionActive = now < this.firstMatchTime;
        const timeLimit = req.auth.id === userId ? null : now;

        const promises = [
            db.getUser(userId),
            db.getMatchPredictionsByUser(userId, timeLimit)
        ];
        if (req.auth.id === userId || !championPredictionActive) {
            promises.push(db.getChampionPrediction(userId));
        }

        Promise.all(promises).then(([user, matchPredictions, championPrediction=null]) => {
            if (!user) {
                return res.json(null);
            }
            matchPredictions.forEach(prediction => {
                prediction.active = new Date() < prediction.match_time;
            });
            res.json({
                matches: matchPredictions,
                champion: championPrediction,
                active: {
                    champion: championPredictionActive
                }
            });
        });
    }

    savePredictions(req, res) {
        const userId = req.auth.id;
        if (!req.body || typeof(req.body) !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({code: 400, error: `Missing body or wrong format`});
        }
        const {champion, matches} = req.body;
        if (matches && matches.some(match => this.__validateMatchPrediction(match))) {
            return res.status(400).json({code: 400, error: `Wrong format of match predictions`});
        }
        if (champion && !Number.isInteger(champion)) {
            return res.status(400).json({code: 400, error: `Wrong format of champion prediction`});
        }
        const promises = [];
        if (matches) {
            promises.push(this.__saveMatchPredictions(userId, matches));
        }
        if (champion) {
            promises.push(this.__saveChampionPrediction(userId, champion));
        }
        return Promise.all(promises).then(() => {
            this.getPredictions(req, res);
        }).catch(error => {
            res.status(500).json({code: 500, error: `Error when updating user predictions: ${error}`});
        });
    }

    __saveMatchPredictions(userId, matches) {
        matches = matches.filter(({match_id}) => {
            if (!this.matches.has(match_id)) {
                return false;
            }
            const match = this.matches.get(match_id);
            return new Date() < match.time;
        });
        return db.updateMatchPredictions(userId, matches);
    }

    __saveChampionPrediction(userId, teamId) {
        if (new Date() > this.firstMatchTime) {
            return Promise.resolve();
        }
        return db.updateChampionPrediction(userId, teamId);
    }

    __validateMatchPrediction(prediction) {
        if (!prediction || typeof(prediction) !== 'object' || Array.isArray(prediction)) {
            return true;
        }
        const {match_id, tip_a, tip_b} = prediction;
        if (!Number.isInteger(match_id)) {
            return true;
        }
        if (tip_a === null && tip_b === null) {
            return false;
        }
        if (Number.isInteger(tip_a) && tip_a >= 0 && Number.isInteger(tip_b) && tip_b >= 0) {
            return false;
        }
        return true;
    }

    getMatch(req, res) {
        const matchId = req.params.id;
        const userId = req.auth.id;
        db.getMatch(matchId).then(match => {
            if (!match) {
                return res.json(null);
            }
            match.active = new Date() <= match.time;
            db.getMatchPredictionsByMatch(matchId).then(predictions => {
                match.user_prediction = predictions.find(tip => tip.user_id === userId);
                match.predictions = match.active ? null : predictions;
                res.json(match);
            });
        });
    }

    saveMatchResult(req, res) {
        const matchId = req.params.id;
        const result = req.body;
        if (!result || typeof(result) !== 'object' || Array.isArray(result)) {
            return res.status(400).json({code: 400, error: `Missing body or wrong format`});
        }
        const {score_a, score_b} = result;
        if (!Number.isInteger(score_a) || !Number.isInteger(score_b)) {
            return res.status(400).json({code: 400, error: `Missing body or wrong format`});
        }
        db.getMatch(matchId).then(match => {
            if (!match) {
                return res.status(404).json({code: 404, error: `Unknown match with id '${matchId}'`});
            } else if (match.time > new Date()) {
                return res.status(400).json({code: 400, error: `Cannot set result for match before it has started`});
            }
            db.updateMatchResult(matchId, score_a, score_b)
                .then(match => res.json(match));
        });
    }

    getTeams(req, res) {
        db.getTeams().then(teams => {
            res.json(teams);
        });
    }

    register(req, res) {
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

    login(req, res) {
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
