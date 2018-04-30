// Import libraries
import 'lib/semantic/dist/semantic';
import 'lib/semantic/dist/semantic.min.css';
import 'jquery'
import Vue from 'vue';
import VueRouter from 'vue-router';

// Import main style sheet
import 'styles/style.scss';

// Import components
import 'components/app';
import 'components/nav-menu';

import {default as TipsComponent} from 'components/tips';
import {default as RankingComponent} from 'components/ranking';
import {default as ScheduleComponent} from 'components/schedule';
import {default as RulesComponent} from 'components/rules';

// Configure router
Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/tips', component: TipsComponent},
        {path: '/ranking', component: RankingComponent},
        {path: '/schedule', component: ScheduleComponent},
        {path: '/rules', component: RulesComponent},
    ]
});

// Bootstrap app
const app = new Vue({
    router: router
}).$mount('#app');
