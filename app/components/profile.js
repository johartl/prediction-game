export default {
    inject: ['apiService'],
    data: () => ({
        user: null,
        predictions: null
    }),
    mounted() {
        const userId = this.$route.params.id;
        Promise.all([
            this.apiService.getProfile(userId),
            this.apiService.getPredictions(userId)
        ]).then(([user, predictions]) => {
            this.user = user;
            this.predictions = predictions;
        });
    },
    template: `
    <div class="ui container profile-component" v-if="user">
        <h1>Profile: {{ user.login }}</h1>
        
        <div style="display: flex; flex-direction: column; align-items: center;">
            <table class="ui padded striped celled large table" style="max-width: 500px;">
                <thead>
                    <tr>
                        <th colspan="2" class="center aligned">
                            <h4>Profile</h4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Rank</strong></td>
                        <td>{{ user.rank }}</td>
                    </tr>
                    <tr>
                        <td><strong>Points</strong></td>
                        <td>{{ user.points }}</td>
                    </tr>
                    <tr>
                        <td><strong>Correct predictions</strong></td>
                        <td>{{ user.predictions_correct }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        
        <h1>{{ user.login }}'s predictions</h1>
        <h3>Special predictions</h3>
        <div style="display: flex; flex-direction: column; align-items: center;">
            <table class="ui padded striped celled large table" style="max-width: 500px;">
                <thead>
                    <tr>
                        <th colspan="2" class="center aligned">
                            <h4>Predictions</h4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Champion prediction</td>
                        <td v-if="predictions.champion">{{ predictions.champion.name }}</td>
                        <td v-if="!predictions.champion" class="disabled">n/a</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <h3>Match predictions</h3>
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
            <tr v-for="prediction in predictions.matches">
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
                <td v-if="prediction.tip_a === null  || prediction.tip_b === null" class="center aligned disabled">
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
