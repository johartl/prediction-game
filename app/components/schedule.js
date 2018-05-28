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
                        {{ match.time | moment('H:mm - D. MMM YYYY') }}
                    </td>
                    <td>
                        <router-link :to="{name: 'match', params: {id: match.id}}">
                            <span style="display: flex; font-size: 1.1rem;">
                                <span style="flex: 1 0; display: flex; justify-content: flex-end;">
                                    <b>{{ match.team_a_name }}</b>
                                </span>
                                <span style="flex: 0; padding: 0 6px;">
                                    <img v-bind:src="'flags/small/' + match.team_a_country_code + '.png'" class="flag-small">
                                </span>
                                <span style="flex: 0 1; padding: 0 2px;">vs.</span>
                                <span style="flex: 0; padding: 0 6px;">
                                    <img v-bind:src="'flags/small/' + match.team_b_country_code + '.png'" class="flag-small">
                                </span>
                                <span style="flex: 1 0">
                                    <b>{{ match.team_b_name }}</b>
                                </span>
                            </span>
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
