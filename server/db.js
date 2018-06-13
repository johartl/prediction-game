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
            select id, rank, login, points, predictions_correct 
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
            select id, login, roles
            from "user"
            where id = $1
        `;
        return this.queryOne({name: 'user', text, values: [userId]});
    }

    getProfile(userId) {
        const text = `
            select u.id, u.login, r.rank, r.points, r.predictions_correct
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

    getMatchPredictionsByUser(userId, before = null) {
        let name = 'match-predictions-by-user';
        const values = [userId];
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
                p.tip_a, 
                p.tip_b,
                p.points
            from schedule s
            join team ta on s.team_a = ta.id 
            join team tb on s.team_b = tb.id 
            join "user" u on u.id = $1
            left join prediction p on p.match_id = s.id and p.user_id = u.id
        `;
        if (before) {
            name = 'match-predictions-by-user-before';
            text += 'where s.time <= $2';
            values.push(before);
        }
        text += `order by s.time`;
        return this.queryMany({name, text, values})
    }

    updateMatchPredictions(userId, tips) {
        const updateStatement = `
            insert into prediction (user_id, match_id, tip_a, tip_b)
            values ($1, $2, $3, $4)
            on conflict (user_id, match_id) do update set tip_a = excluded.tip_a, tip_b = excluded.tip_b
        `;
        const updateName = 'update-user-tip';

        const deleteStatement = `
            delete from prediction
            where user_id = $1 and match_id = $2
        `;
        const deleteName = 'delete-user-prediction';

        return Promise.all(tips.map(({match_id, tip_a, tip_b}) => {
            if (tip_a === null && tip_b === null) {
                return this.queryOne({name: deleteName, text: deleteStatement, values: [userId, match_id]});
            } else {
                return this.queryOne({name: updateName, text: updateStatement,
                    values: [userId, match_id, tip_a, tip_b]});
            }
        }));
    }

    getChampionPrediction(userId) {
        let text = `
            select t.id, t.name
            from prediction_champion p, team t 
            where p.team_id = t.id and user_id = $1
        `;
        return this.queryOne({name: 'champion-prediction', text, values: [userId]});
    }

    updateChampionPrediction(userId, teamId) {
        let text = `
            insert into prediction_champion (user_id, team_id)
            values ($1, $2)
            on conflict (user_id) do update set team_id = excluded.team_id
        `;
        return this.queryOne({name: 'update-champion-prediction', text, values: [userId, teamId]});
    }

    getMatchPredictionsByMatch(matchId, userId = null) {
        let text = `
            select u.id as user_id, u.login, p.tip_a, p.tip_b, p.points
            from "user" u, prediction p
            where 
                p.user_id = u.id and 
                p.match_id = $1
        `;
        let name = 'match-predictions-by-match';
        const values = [matchId];
        if (userId) {
            name = 'match-predictions-by-match-and-user';
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

    updateMatchResult(matchId, scoreA, scoreB) {
        const text = `
            update schedule
            set score_a = $1, score_b = $2
            where id = $3
            returning *
        `;
        return this.queryOne({name: 'update-match-result', values: [scoreA, scoreB, matchId]});
    }

    insertUser(login, password) {
        const text = `
            insert into "user" (login, password, created_at)
            values ($1, $2, now())
            returning id
        `;
        return this.queryOne({name: 'insert-user', text, values: [login, password]}).then(user => user.id);
    }

    getTeams() {
        const text = `
            select id, name, country_code, "group"
            from team
        `;
        return this.queryMany({name: 'team', text});
    }
}

module.exports = new Database();
