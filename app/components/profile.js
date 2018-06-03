export default {
    inject: ['apiService'],
    data: () => ({
        user: null,
        tips: null
    }),
    mounted() {
        const userId = this.$route.params.id;
        Promise.all([
            this.apiService.getProfile(userId),
            this.apiService.getUserTips(userId)
        ]).then(([user, tips]) => {
            this.user = user;
            this.tips = tips;
        });
    },
    template: `
    <div class="ui container profile-component" v-if="user">
        <h1>Profile: {{ user.login }}</h1>
        
        <div style="display: flex; flex-direction: column; align-items: center;">
            <table class="ui striped celled table" style="max-width: 500px;">
                <thead>
                    <tr>
                        <th colspan="2" class="center aligned">
                            <h4>Profile</h4>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Rank</td>
                        <td>{{ user.rank }}</td>
                    </tr>
                    <tr>
                        <td>Points</td>
                        <td>{{ user.points }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <h1>{{ user.login }}'s tips</h1>
        <table class="ui striped selectable celled table">
            <thead>
                <tr>
                    <th>Time and date</th>
                    <th>Match</th>
                    <th>Score</th>
                    <th>Tip</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
            <tr v-for="tip in tips">
                <td>
                    {{ tip.match_time | moment('H:mm - D. MMM YYYY') }}
                </td>
                <td>
                    <router-link :to="{name: 'match', params: {id: tip.match_id}}">
                        <b>{{ tip.team_a_name }}</b> vs. <b>{{ tip.team_b_name }}</b>
                    </router-link>
                </td>
                
                <td v-if="tip.score_a !== null && tip.score_b !== null">
                    {{ tip.score_a }} : {{ tip.score_b }}
                </td>
                <td v-if="tip.score_a === null || tip.score_b === null" class="disabled">
                    n/a
                </td>
                
                <td v-if="tip.tip_a !== null && tip.tip_b !== null">
                    {{ tip.tip_a }} : {{ tip.tip_b }}
                </td>
                <td v-if="tip.tip_a === null  || tip.tip_b === null" class="disabled">
                    n/a
                </td>
                
                <td v-if="tip.points !== null">
                    {{ tip.points }}
                </td>
                <td v-if="tip.points === null" class="disabled">
                    n/a
                </td>
                
            </tr>
          </tbody>
        </table>
    </div>
    `
};
