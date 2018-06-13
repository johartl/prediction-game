export default {
    inject: ['apiService', 'userService'],
    data: () => ({
        ranking: [],
        user: null
    }),
    mounted() {
        this.user = this.userService.getUser();
        this.apiService.getRanking().then(ranking => this.ranking = ranking);
    },
    template: `
    <div class="ui container ranking-component">
        <h1>Ranking</h1>
        <table class="ui striped selectable celled definition table">
            <thead>
                <tr>
                    <th width="100"></th>
                    <th>Player</th>
                    <th>Correct predictions</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
            <tr v-for="rank in ranking" v-bind:class="{'warning': rank.id == user.id}">
                <td>
                    #{{ rank.rank }}
                </td>
                <td>
                    <router-link :to="{name: 'profile', params: {id: rank.id}}">{{ rank.login }}</router-link>
                </td>
                <td>
                    {{ rank.predictions_correct }}
                </td>
                <td>
                    {{ rank.points }}
                </td>
            </tr>
          </tbody>
        </table>
    </div>
    `
};
