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
            select id, rank, login, points 
            from ranking
        `;
        return this.queryMany({name: 'ranking', text});
    }

    getSchedule() {
        const text = `
            select 
                s.id, 
                s.team_a as team_a, 
                ta.name as team_a_name,
                ta.country_code as team_a_country_code,
                ta.group as team_a_group,
                s.team_b as team_b, 
                tb.name as team_b_name,
                tb.country_code as team_b_country_code,
                tb.group as team_b_group,
                s.time as time, 
                s.type as type, 
                score_a, 
                score_b 
            from schedule s, team ta, team tb
            where s.team_a = ta.id and s.team_b = tb.id
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

    getProfile(userId) {
        const text = `
            select u.id, u.login, r.rank, r.points
            from "user" u, ranking r
            where r.id = u.id
            and u.id = $1
        `;
        return this.queryOne({name: 'profile', text, values: [userId]});
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
            select 
                s.id as match_id, 
                s.team_a, 
                ta.name as team_a_name,
                ta.country_code as team_a_country_code,
                ta.group as team_a_group,
                s.team_b,
                tb.name as team_b_name,
                tb.country_code as team_b_country_code,
                tb.group as team_b_group,
                s.time as match_time,
                s.type as match_type,
                s.score_a,
                s.score_b,
                t.tip_a, 
                t.tip_b,
                t.points
            from schedule s
            join team ta on s.team_a = ta.id 
            join team tb on s.team_b = tb.id 
            join "user" u on u.id = $1
            left join tip t on t.match_id = s.id and t.user_id = u.id
            order by s.time
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

    updateUserTips(userId, tips) {
        const updateStatement = `
            insert into tip (user_id, match_id, tip_a, tip_b)
            values ($1, $2, $3, $4)
            on conflict (user_id, match_id) do update set tip_a = excluded.tip_a, tip_b = excluded.tip_b
        `;
        const updateName = 'update-user-tip';

        const deleteStatement = `
            delete from tip
            where user_id = $1 and match_id = $2
        `;
        const deleteName = 'delete-user-tip';

        return Promise.all(tips.map(({match_id, tip_a, tip_b}) => {
            if (tip_a === null && tip_b === null) {
                return this.queryOne({name: deleteName, text: deleteStatement, values: [userId, match_id]});
            } else {
                return this.queryOne({name: updateName, text: updateStatement,
                    values: [userId, match_id, tip_a, tip_b]});
            }
        }));
    }

    getMatchTips(matchId, userId = null) {
        let text = `
            select u.id as user_id, u.login, t.tip_a, t.tip_b, t.points
            from "user" u, tip t
            where 
                t.user_id = u.id and 
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
            select 
                s.id,
                s.time, 
                s.type, 
                s.score_a, 
                s.score_b,
                ta.id as team_a,
                ta.name as team_a_name,
                ta.country_code as team_a_country_code, 
                tb.id as team_b,
                tb.name as team_b_name,
                tb.country_code as team_b_country_code
            from schedule s
            join team ta on s.team_a = ta.id
            join team tb on s.team_b = tb.id
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
