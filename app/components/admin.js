export default {
    inject: ['apiService', 'alertService'],
    data: () => ({
        matches: []
    }),
    mounted() {
        this.alert = null;
        this.apiService.getSchedule().then(matches => {
            this.matches = matches.filter(match => !match.active);
        });
    },
    methods: {
        setMatches(matches) {
            this.matches = matches.filter(match => !match.active);
        },
        submitMatchResults(matchId, scoreA, scoreB) {
            scoreA = parseInt(scoreA);
            scoreB = parseInt(scoreB);
            if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) {
                scoreA = null;
                scoreB = null;
            }
            this.apiService.submitMatchResult(matchId, scoreA, scoreB).then(updatedMatch => {
                this.matches = this.matches.map(match => match.id === updatedMatch ? updatedMatch : match);
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addSuccess({text: `Successfully submitted match result`}, 5000);
            }).catch(({error, code}) => {
                this.alertService.removeAlert(this.alert);
                this.alert = this.alertService.addError({text: `Error when submitting match result: ${error} (${code})`});
            });
        }
    },
    template: `
    <div class="ui container admin-component">
        <h1>Admin area</h1>
        
        <h3>Match results</h3>
        
        <table class="ui striped selectable celled table">
            <thead>
                <tr>
                    <th>Time and date</th>
                    <th>Match</th>
                    <th>Result</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="match in matches">
                    <td>
                        {{ match.time | moment('H:mm - D. MMM YYYY') }}
                    </td>
                    <td>
                        <b>{{ match.team_a_name }}</b> vs. <b>{{ match.team_b_name }}</b>
                    </td>
                    <td>
                        <div class="ui input">
                            <input type="number" v-model="match.score_a" min="0" max="99"
                                   style="width: 70px; text-align: center;">
                        </div>
                        :
                        <div class="ui input" >
                            <input type="number" v-model="match.score_b" min="0" max="99"
                                   style="width: 70px; text-align: center;" >
                        </div>
                    </td>
                    <td>
                        <button type="button" class="ui floated labeled icon teal submit button"
                            v-on:click="submitMatchResults(match.id, match.score_a, match.score_b)">
                            <i class="save icon"></i>
                            Submit results
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `
};
