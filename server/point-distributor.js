const db = require('./db');

class PointStrategy {

    constructor() {
        this.POINTS_RESULT = 4;
        this.POINTS_WIN_GOAL_DIFFERENCE = 2;
        this.POINTS_WIN_TENDENCY = 1;
        this.POINTS_DRAW_TENDENCY = 2;
        this.POINTS_NO_SUBMISSION = 0;
        this.POINTS_ZERO = 0;
        this.POINTS_CHAMPION_PREDICTION = 10;
    }

    getPointsForMatchPrediction(score_a, score_b, tip_a, tip_b) {
        if (!Number.isInteger(score_a) || !Number.isInteger(score_b)) {
            return null;
        }
        if (!Number.isInteger(tip_a) || !Number.isInteger(tip_b) ||
            tip_a < 0 || tip_b < 0) {
            return this.POINTS_NO_SUBMISSION;
        }
        if (score_a === tip_a && score_b === tip_b) {
            return this.POINTS_RESULT;
        }
        if (score_a !== score_b) {
            // WIN
            if ((score_a - score_b) === (tip_a - tip_b)) {
                return this.POINTS_WIN_GOAL_DIFFERENCE;
            }
            if (score_a > score_b && tip_a > tip_b ||
                score_a < score_b && tip_a < tip_b) {
                return this.POINTS_WIN_TENDENCY;
            }
        } else {
            // DRAW
            if ((score_a - score_b) === (tip_a - tip_b)) {
                return this.POINTS_DRAW_TENDENCY;
            }
        }
        return this.POINTS_ZERO;
    }

    getPointsForChampionPrediction(actual_team, predicted_team) {
        if (Number.isInteger(actual_team) && actual_team === predicted_team) {
            return this.POINTS_CHAMPION_PREDICTION;
        }
        return this.POINTS_ZERO;
    }
}

class PointDistributor {
    constructor() {
        this.strategy = new PointStrategy();
    }

    run() {
        const updates = [];
        return db.getPredictions().then(predictions => {
            const updates = predictions.map(({user_id, match_id, score_a, score_b, tip_a, tip_b}) => {
                const points = this.strategy.getPointsForMatchPrediction(score_a, score_b, tip_a, tip_b);
                return db.updatePredictionPoints(user_id, match_id, points);
            });
            return Promise.all(updates);
        });
    }
}

module.exports = new PointDistributor();
