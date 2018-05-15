// Import libraries
import Vue from 'vue';
import 'lib/semantic/dist/semantic';
import 'lib/semantic/dist/semantic.min.css';
import 'jquery'
import 'rxjs/add/operator/first';

// Import main style sheet
import 'styles/style.scss';

import {router} from 'router';

// Import services
import {apiService} from './services/api';
import {userService} from './services/user';
import {alertService} from './services/alert';

const services = {apiService, userService, alertService};

if (BUILD_ENV === 'dev') {
    Object.assign(window, services);
}

// Import components
import 'components/app';
import 'components/nav-menu';
import 'components/alert';
import 'components/tips';
import 'components/ranking';
import 'components/schedule';
import 'components/rules';
import 'components/profile';
import 'components/login';
import 'components/signup';
import 'components/dashboard';
import 'components/impress';

// Bootstrap app
const app = new Vue({
    el: '#app',
    router,
    provide: services
});
