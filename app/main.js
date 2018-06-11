// Import libraries
import Vue from 'vue';
import 'lib/semantic/dist/semantic';
import 'lib/semantic/dist/semantic.min.css';
import 'jquery'
import 'rxjs/add/operator/first';
import vueMoment from 'vue-moment';

// Import main style sheet
import 'styles/style.scss';

import {router} from 'router';
Vue.use(vueMoment);

// Import services
import {apiService} from './services/api';
import {userService} from './services/user';
import {alertService} from './services/alert';

const services = {apiService, userService, alertService};

if (BUILD_ENV === 'dev') {
    Object.assign(window, services);
}

// Import components
import 'components/alert';
import 'components/app';
import 'components/dashboard';
import 'components/login';
import 'components/match';
import 'components/nav-menu';
import 'components/profile';
import 'components/ranking';
import 'components/rules';
import 'components/schedule';
import 'components/signup';
import 'components/prediction';

// Bootstrap app
const app = new Vue({
    el: '#app',
    router,
    provide: services
});
