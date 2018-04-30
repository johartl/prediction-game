import Vue from 'vue';

Vue.component('nav-menu', {
    data: () => ({
        items: [
            {title: 'Tips', link: 'tips'},
            {title: 'Schedule', link: 'schedule'},
            {title: 'Ranking', link: 'ranking'},
            {title: 'Rules', link: 'rules'},
        ]
    }),
    template: `
    <div class="ui huge menu fixed">
        <div class="header item">
            Tip match 2018
        </div>
        <router-link v-for="item in items" v-bind:to="item.link" :key="item.link" class="item">
            {{item.title}}
        </router-link>

        <div class="right menu">
            <div class="item">
                <a class="ui button">Log in</a>
            </div>
            <div class="item">
                <a class="ui button primary">Sign up</a>
            </div>
        </div>
    </div>
    `
});
