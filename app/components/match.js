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
            this.tipA = match.user_tip ? match.user_tip.tip_a : null;
            this.tipB = match.user_tip ? match.user_tip.tip_b : null;
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
        saveTips() {
            const tip = {
                match_id: this.match.id,
                tip_a: null,
                tip_b: null
            };
            if (this.isValid(this.tipA, this.tipB)) {
                tip.tip_a = parseInt(this.tipA);
                tip.tip_b = parseInt(this.tipB);
            }

            this.loading = true;
            this.error = false;
            this.apiService.updateUserTips([tip]).then(tips => {
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addSuccess({text: `Successfully saved tip`}, 5000);
            }).catch(({code, error}) => {
                this.error = true;
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addError({text: `Error when saving tip: ${error} (${code})`}, 5000);
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
            <table class="ui striped celled table" style="max-width: 650px">
                <thead>
                    <tr>
                        <th colspan="2" class="center aligned">
                            <h4>Match details</h4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Date and time</td>
                        <td>{{ match.time | moment('H:mm - D. MMM YYYY') }}</td>
                    </tr>
                    <tr>
                        <td>Match type</td>
                        <td>{{ getMatchType(match.type) }}</td>
                    </tr>
                    <tr v-if="match.score_a && match.score_b">
                        <td>Result</td>
                        <td>{{ match.score_a }}:{{ match.score_b }}</td>
                    </tr>
                </tbody>
            </table>
            
            <form v-if="match.active" v-on:submit.prevent="saveTips" style="display: contents;">
                <table class="ui celled table" style="max-width: 650px">
                    <thead>
                        <tr>
                            <th class="center aligned">
                                <h4>Your tip</h4>
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
                                    Save tip
                                </button>
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </form>
        </div>
        
        <h1>Tips</h1>
        <div v-if="match.tips == null" class="ui message">
            <i class="info icon"></i>
            Tips of other members will be displayed after the match has started.
        </div>
        
        <table v-if="match.tips != null" class="ui striped selectable celled table">
            <thead>
                <tr>
                    <th>Member</th>
                    <th class="center aligned">Tip</th>
                    <th class="center aligned">Points</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="tip in match.tips">
                    <td>
                        <router-link :to="{name: 'profile', params: {login: tip.user_id}}">
                            {{ tip.login }}
                        </router-link>
                    </td>
                    <td class="center aligned">
                        <span v-if="tip.tip_a && tip.tip_b">
                            <b>{{ tip.tip_a }} : {{ tip.tip_b }}</b>
                        </span>
                    </td>
                    <td class="center aligned">
                        {{ tip.points }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `
};
