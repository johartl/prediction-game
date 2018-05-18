import {getMatchType} from '../shared/match-types';

export default {
    inject: ['apiService'],
    data: () => ({
        matches: []
    }),
    methods: {
        getMatchType: getMatchType
    },
    mounted() {
        this.apiService.getSchedule().then(matches => this.matches = matches);
    },
    template: `
    <div class="ui container schedule-component">
        <h1>Schedule</h1>
        <table class="ui striped selectable celled table">
            <thead>
                <tr>
                    <th>Time and date</th>
                    <th>Match</th>
                    <th>Type</th>
                    <th class="center aligned">Score</th>
                </tr>
            </thead>
            <tbody>
            <tr v-for="match in matches">
                <td>
                    {{ match.time | moment("hh:mm - D. MMM YYYY") }}
                </td>
                <td>
                    <router-link :to="{name: 'match', params: {id: match.id}}">
                        <b>{{ match.team_a_name }}</b> vs. <b>{{ match.team_b_name }}</b>
                    </router-link>
                </td>
                <td>
                    {{ getMatchType(match.type) }}
                </td>
                <td class="center aligned">
                    <span v-if="match.score_a && match.score_b">
                        <b>{{ match.score_a }}:{{ match.score_b }}</b>
                    </span>
                </td>
            </tr>
          </tbody>
        </table>
    </div>
    `
};
