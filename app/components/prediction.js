export default {
    inject: ['apiService', 'userService', 'alertService'],
    data: () => ({
        activeTips: [],
        inactiveTips: [],
        loading: false,
        error: false
    }),
    methods: {
        isValid(tip) {
            const tipA = parseInt(tip.tip_a);
            const tipB = parseInt(tip.tip_b);
            return !isNaN(tipA) && tipA >= 0 &&
                   !isNaN(tipB) && tipB >= 0;
        },
        getRowStyle(tip) {
            if (this.isValid(tip)) {
                return;
            }
            const secondsToMatch = (new Date(tip.match_time) - new Date()) / 1000;
            return secondsToMatch < 3600 * 12 ? 'error' : 'warning';
        },
        saveTips() {
            const prediction = this.activeTips.map(tip => {
                if (this.isValid(tip)) {
                    return {
                        match_id: tip.match_id,
                        tip_a: parseInt(tip.tip_a),
                        tip_b: parseInt(tip.tip_b)
                    };
                } else {
                    return {
                        match_id: tip.match_id,
                        tip_a: null,
                        tip_b: null
                    };
                }
            });
            this.loading = true;
            this.error = false;
            this.apiService.updateUserTips(prediction).then(tips => {
                this.setTips(tips);
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
        setTips(tips) {
            this.activeTips = tips.filter(tip => tip.active);
            this.inactiveTips = tips.filter(tip => tip.inactive);
        }
    },
    mounted() {
        this.alert = null;
        this.apiService.getUserTips().then(tips => this.setTips(tips));
    },
    template: `
    <div class="ui container tips-component">
        <h1>Match predictions</h1>
        
        <form v-on:submit.prevent="saveTips">
            <table class="ui striped selectable celled table">
                <thead>
                    <tr>
                        <th>Time and date</th>
                        <th>Match</th>
                        <th>Prediction</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tip in activeTips" v-bind:class="getRowStyle(tip)">
                        <td>
                            {{ tip.match_time | moment('H:mm - D. MMM YYYY') }}
                        </td>
                        <td>
                            <router-link :to="{name: 'match', params: {id: tip.match_id}}">
                                <b>{{ tip.team_a_name }}</b> vs. <b>{{ tip.team_b_name }}</b>
                            </router-link>
                        </td>
                        <td>
                            <div class="ui input">
                                <input type="number" v-model="tip.tip_a" min="0" max="99"
                                       style="width: 70px; text-align: center;">
                            </div>
                            :
                            <div class="ui input" >
                                <input type="number" v-model="tip.tip_b" min="0" max="99"
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
                    <th>Score</th>
                    <th>Prediction</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
            <tr v-for="tip in inactiveTips">
                <td>
                    {{ tip.match_time | moment('H:mm - D. MMM YYYY') }}
                </td>
                <td>
                    <router-link :to="{name: 'match', params: {id: tip.match_id}}">
                        <b>{{ tip.team_a_name }}</b> vs. <b>{{ tip.team_b_name }}</b>
                    </router-link>
                </td>
                <td>
                    {{ tip.score_a }} : {{ tip.score_b }}
                </td>
                <td>
                    {{ tip.tip_a }} : {{ tip.tip_b }}
                </td>
                <td>
                    {{ tip.points }}
                </td>
            </tr>
          </tbody>
        </table>
    </div>
    `
};