export default {
    inject: ['apiService'],
    data: () => ({
        ranking: []
    }),
    mounted() {
        this.apiService.getRanking().then(ranking => this.ranking = ranking);
    },
    template: `
    <div class="ui container ranking-component">
        <table class="ui striped selectable celled definition table">
            <thead>
                <tr>
                    <th width="100"></th>
                    <th>Member</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
            <tr v-for="rank in ranking">
                <td>
                    #{{ rank.rank }}
                </td>
                <td>
                    <router-link :to="{name: 'profile', params: {login: rank.id}}">{{ rank.login }}</router-link>
                </td>
                <td>
                    {{ rank.score }}
                </td>
            </tr>
          </tbody>
        </table>
    </div>
    `
};
