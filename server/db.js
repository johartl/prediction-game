const {Pool, Client} = require('pg');

const config = require('./config');
const logger = require('./logger');

class Database {
    constructor() {
        this.client = new Client(config.dbConnection);

    }

    connect() {
        return this.client.connect()
            .catch(error => {
                logger.error(`Could not connect to database: ${JSON.stringify(config.dbConnection)}`);
                throw error;
            });
    }

    query(...args) {
        return this.client.query(...args)
    }

    queryMany(...args) {
        return this.query(...args).then(result => result.rows);
    }

    queryOne(...args) {
        return this.query(...args).then(result => {
            if (result.rows.length === 1) {
                return result.rows[0];
            } else if (result.rows.length === 0) {
                return null;
            }
            throw new Error(`Expected single result but got ${result.rows.length} results instead`);
        });
    }

    getRanking() {
        const text = `
            select id, rank, login, score 
            from ranking
        `;
        return this.queryMany({name: 'ranking', text});
    }

    getSchedule() {
        const text = `
            select id, team_a, team_b, time, type, score_a, score_b 
            from schedule
            order by time
        `;
        return this.queryMany({name: 'schedule', text});
    }

    getUser(userId) {
        const text = `
            select id, login
            from "user"
            where id = $1
        `;
        return this.queryOne({name: 'user', text, values: [userId]});
    }

    getUserLogin(login) {
        const text = `
            select id, login, password
            from "user"
            where login ilike $1
        `;
        return this.queryOne({name: 'user-login', text, values: [login]});
    }

    getUserTips(userId, before = null) {
        let text = `
            select t.match_id, 
                ta.id, ta.name, ta.country_code, ta.group,
                tb.id, tb.name, tb.country_code, tb.group,
                t.score_a, t.score_b
            from tip t, schedule s, team ta, team tb
            where 
                t.match_id = s.id and 
                s.team_a = ta.id and 
                s.team_b = tb.id and
                t.user_id = $1
        `;
        let name = 'user-tips';
        const values = [userId];
        if (before) {
            name = 'user-tips-before';
            text += 'and s.time <= $2';
            values.push(before);
        }
        return this.queryMany({name, text, values})
    }

    getMatchTips(matchId, userId = null) {
        let text = `
            select u.id, u.login, t.score_a, t.score_b, t.points
            from "user" u, tip t, team ta, team tb
            where 
                t.user_id = u.id and 
                t.team_a = ta.id and 
                t.team_b = tb.id and
                t.match_id = $1
        `;
        let name = 'match-tips';
        const values = [matchId];
        if (userId) {
            name = 'match-tips-user';
            text += 'and u.id = $2';
            values.push(userId);
        }
        return this.queryMany({name, text, values})
    }

    getMatch(matchId) {
        const text = `
            select s.id, s.time, s.type, s.score_a, s.score_b,
                ta.id, ta.name, ta.country_code, 
                tb.id, tb.name, tb.country_code
            from schedule s, team ta, team tb
            where 
                s.team_a = ta.id and 
                s.team_b = tb.id and
                s.id = $1
        `;
        return this.queryOne({name: 'match', text, values: [matchId]});
    }

    insertUser(login, password) {
        const text = `
            insert into "user" (login, password, created_at)
            values ($1, $2, now())
            returning id
        `;
        return this.queryOne({name: 'insert-user', text, values: [login, password]}).then(user => user.id);
    }
}

module.exports = new Database();
