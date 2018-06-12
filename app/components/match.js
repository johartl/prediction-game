import {getMatchType} from '../shared/match-types';

export default {
    inject: ['apiService', 'alertService'],
    data: () => ({
        match: null,
        tipA: null,
        tipB: null,
        loading: false,
        error: false
    }),
    mounted() {
        this.alert = null;
        const matchId = this.$route.params.id;
        this.apiService.getMatch(matchId).then(match => {
            this.match = match;
            this.tipA = match.user_prediction ? match.user_prediction.tip_a : null;
            this.tipB = match.user_prediction ? match.user_prediction.tip_b : null;
        });
    },
    methods: {
        getMatchType: getMatchType,
        isValid(tipA, tipB) {
            tipA = parseInt(tipA);
            tipB = parseInt(tipB);
            return !isNaN(tipA) && tipA >= 0 &&
                !isNaN(tipB) && tipB >= 0;
        },
        savePredictions() {
            const prediction = {
                match_id: this.match.id,
                tip_a: null,
                tip_b: null
            };
            if (this.isValid(this.tipA, this.tipB)) {
                prediction.tip_a = parseInt(this.tipA);
                prediction.tip_b = parseInt(this.tipB);
            }
            const predictions = {
                matches: [prediction]
            };

            this.loading = true;
            this.error = false;
            this.apiService.updatePredictions(predictions).then(updatedPredictions => {
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addSuccess({text: `Successfully saved prediction`}, 5000);
            }).catch(({code, error}) => {
                this.error = true;
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addError({text: `Error when saving prediction: ${error} (${code})`}, 5000);
            }).finally(() => {
                this.loading = false;
            });
        }
    },
    template: `
    <div class="ui container match-component" v-if="match">
        
        <div style="display: flex; justify-content: center;">
            <div style="flex: 1 0; max-width: 300px;" class="flag-large">
                <img v-bind:src="'flags/large/' + match.team_a_country_code + '.png'">
            </div>
            <div style="width: 30px"></div>
            <div style="flex: 1 0; max-width: 300px;" class="flag-large">
                <img v-bind:src="'flags/large/' + match.team_b_country_code + '.png'">
            </div>
        </div>
        <div style="text-align: center; padding: 8px 0;">
            <h1>{{ match.team_a_name }} vs. {{ match.team_b_name }}</h1>
        </div>
        
        <div style="display: flex; flex-direction: column; align-items: center;">
            <table class="ui padded striped celled large table" style="max-width: 650px">
                <thead>
                    <tr>
                        <th colspan="2" class="center aligned">
                            <h4>Match details</h4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Date and time</strong></td>
                        <td>{{ match.time | moment('H:mm - D. MMM YYYY') }}</td>
                    </tr>
                    <tr>
                        <td><strong>Match type</strong></td>
                        <td>{{ getMatchType(match.type) }}</td>
                    </tr>
                    <tr v-if="match.score_a && match.score_b">
                        <td><strong>Result</strong></td>
                        <td>{{ match.score_a }}:{{ match.score_b }}</td>
                    </tr>
                </tbody>
            </table>
            
            <form v-if="match.active" v-on:submit.prevent="savePredictions" style="display: contents;">
                <table class="ui padded celled large table" style="max-width: 650px">
                    <thead>
                        <tr>
                            <th class="center aligned">
                                <h4>Your prediction</h4>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="center aligned" v-bind:class="{'warning': !isValid(tipA, tipB)}">
                            <div style="padding: 12px 0;">
                                <span style="font-weight:bold; padding-right: 6px;">
                                    {{ match.team_a_name }}
                                </span>
                                <div class="ui input">
                                    <input type="number" v-model="tipA" min="0" max="99"
                                           style="width: 70px; text-align: center;">
                                </div>
                                &nbsp; : &nbsp;
                                <div class="ui input">
                                    <input type="number" v-model="tipB" min="0" max="99"
                                           style="width: 70px; text-align: center;" >
                                </div>
                                <span style="font-weight:bold; padding-left: 6px;">
                                    {{ match.team_b_name }}
                                </span>
                            </div>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th class="center aligned">
                                <button type="submit" class="ui floated labeled icon teal submit button"
                                        v-bind:class="{'loading': loading, 'negative': error}">
                                    <i class="save icon"></i>
                                    Save prediction
                                </button>
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </form>
        </div>
        
        <h1>Predictions</h1>
        <div v-if="match.predictions == null" class="ui message">
            <i class="info icon"></i>
            Predictions of other players will be displayed after the match has started.
        </div>
        
        <table v-if="match.predictions != null" class="ui striped selectable celled table">
            <thead>
                <tr>
                    <th>Player</th>
                    <th class="center aligned">Prediction</th>
                    <th class="center aligned">Points</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="prediction in match.predictions">
                    <td>
                        <router-link :to="{name: 'profile', params: {login: prediction.user_id}}">
                            {{ prediction.login }}
                        </router-link>
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
