export default {
    inject: ['apiService', 'userService', 'alertService'],
    data: () => ({
        activeMatchPredictions: [],
        inactiveMatchPredictions: [],
        championPrediction: null,
        championPredictionActive: false,
        championPredictionSelect: null,
        teams: [],
        loading: false,
        error: false
    }),
    mounted() {
        this.alert = null;
        this.apiService.getPredictions().then(predictions => this.setPredictions(predictions));
        this.apiService.getTeams().then(teams => this.teams = teams);
    },
    methods: {
        isValid(prediction) {
            const tipA = parseInt(prediction.tip_a);
            const tipB = parseInt(prediction.tip_b);
            return !isNaN(tipA) && tipA >= 0 &&
                   !isNaN(tipB) && tipB >= 0;
        },
        getRowStyle(prediction) {
            if (this.isValid(prediction)) {
                return;
            }
            const secondsToMatch = (new Date(prediction.match_time) - new Date()) / 1000;
            return secondsToMatch < 3600 * 12 ? 'error' : 'warning';
        },
        savePredictions() {
            const predictions = {};

            predictions.matches = this.activeMatchPredictions.map(prediction => {
                if (this.isValid(prediction)) {
                    return {
                        match_id: prediction.match_id,
                        tip_a: parseInt(prediction.tip_a),
                        tip_b: parseInt(prediction.tip_b)
                    };
                } else {
                    return {
                        match_id: prediction.match_id,
                        tip_a: null,
                        tip_b: null
                    };
                }
            });

            predictions.champion = this.championPredictionSelect || null;

            this.loading = true;
            this.error = false;
            this.apiService.updatePredictions(predictions).then(updatedPredictions => {
                this.setPredictions(updatedPredictions);
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addSuccess({text: `Successfully saved predictions`}, 5000);
            }).catch(({code, error}) => {
                this.error = true;
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addError({text: `Error when saving predictions: ${error} (${code})`});
            }).finally(() => {
                this.loading = false;
            });
        },
        setPredictions(predictions) {
            this.activeMatchPredictions = predictions.matches.filter(prediction => prediction.active);
            this.inactiveMatchPredictions = predictions.matches.filter(prediction => !prediction.active);
            this.championPrediction = predictions.champion;
            this.championPredictionActive = predictions.active.champion;
            if (this.championPrediction) {
                this.championPredictionSelect = this.championPrediction.id;
            }
        }
    },
    template: `
    <div class="ui container predictions-component">

        <form v-on:submit.prevent="savePredictions">
            <h1>Predictions</h1>
            <h3>Special predictions</h3>
            <table class="ui padded striped celled table">
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Prediction</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Champion prediction</strong></td>
                        <td v-if="championPredictionActive">
                            <div class="ui input">
                                <select v-if="teams" v-model="championPredictionSelect" 
                                        class="ui compact selection dropdown">
                                    <option v-for="team in teams" v-bind:value="team.id">
                                        {{ team.name }}
                                    </option>
                                </select>
                            </div>
                        </td>
                        <td v-if="!championPredictionActive && championPrediction">
                            {{ championPrediction.name }}
                        </td>
                        <td v-if="!championPredictionActive && !championPrediction" class="disabled">
                            n/a
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3" class="center aligned">
                            <button type="submit" class="ui floated labeled icon teal submit button"
                                    v-bind:class="{'loading': loading, 'negative': error}">
                                <i class="save icon"></i>
                                Save predictions
                            </button>
                        </th>
                    </tr>
                </tfoot>
            </table>

            
            <h3>Match predictions</h3>

            <table class="ui striped selectable celled table">
                <thead>
                    <tr>
                        <th>Time and date</th>
                        <th>Match</th>
                        <th>Prediction</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="prediction in activeMatchPredictions" v-bind:class="getRowStyle(prediction)">
                        <td>
                            {{ prediction.match_time | moment('H:mm - D. MMM YYYY') }}
                        </td>
                        <td>
                            <router-link :to="{name: 'match', params: {id: prediction.match_id}}">
                                <b>{{ prediction.team_a_name }}</b> vs. <b>{{ prediction.team_b_name }}</b>
                            </router-link>
                        </td>
                        <td>
                            <div class="ui input">
                                <input type="number" v-model="prediction.tip_a" min="0" max="99"
                                       style="width: 70px; text-align: center;">
                            </div>
                            :
                            <div class="ui input" >
                                <input type="number" v-model="prediction.tip_b" min="0" max="99"
                                       style="width: 70px; text-align: center;" >
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3" class="center aligned">
                            <button type="submit" class="ui floated labeled icon teal submit button"
                                    v-bind:class="{'loading': loading, 'negative': error}">
                                <i class="save icon"></i>
                                Save predictions
                            </button>
                        </th>
                    </tr>
                </tfoot>
            </table>
        </form>
        
        <h1>Prediction history</h1>
        <table class="ui striped selectable celled table">
            <thead>
                <tr>
                    <th>Time and date</th>
                    <th>Match</th>
                    <th class="center aligned">Score</th>
                    <th class="center aligned">Prediction</th>
                    <th class="center aligned">Points</th>
                </tr>
            </thead>
            <tbody>
            <tr v-for="prediction in inactiveMatchPredictions">
                <td>
                    {{ prediction.match_time | moment('H:mm - D. MMM YYYY') }}
                </td>
                <td>
                    <router-link :to="{name: 'match', params: {id: prediction.match_id}}">
                        <b>{{ prediction.team_a_name }}</b> vs. <b>{{ prediction.team_b_name }}</b>
                    </router-link>
                </td>
                <td v-if="prediction.score_a !== null && prediction.score_b !== null" class="center aligned">
                    {{ prediction.score_a }} : {{ prediction.score_b }}
                </td>
                <td v-if="prediction.score_a === null || prediction.score_b === null" class="center aligned disabled">
                    n/a
                </td>
                <td v-if="prediction.tip_a !== null && prediction.tip_b !== null" class="center aligned">
                    {{ prediction.tip_a }} : {{ prediction.tip_b }}
                </td>
                <td v-if="prediction.tip_a === null || prediction.tip_b === null" class="center aligned disabled">
                    n/a
                </td>
                <td v-if="prediction.points !== null" class="center aligned">
                    {{ prediction.points }}
                </td>
                <td v-if="prediction.points === null" class="center aligned disabled">
                    n/a
                </td>
            </tr>
          </tbody>
        </table>
    </div>
    `
};
