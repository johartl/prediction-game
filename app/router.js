import Vue from 'vue';
import VueRouter from 'vue-router';

import {userService} from './services/user';
import {default as TipsComponent} from 'components/tips';
import {default as RankingComponent} from 'components/ranking';
import {default as ScheduleComponent} from 'components/schedule';
import {default as RulesComponent} from 'components/rules';
import {default as LoginComponent} from 'components/login';
import {default as SignupComponent} from 'components/signup';
import {default as DashboardComponent} from 'components/dashboard';
import {default as ImpressComponent} from 'components/impress';

Vue.use(VueRouter);

export const router = new VueRouter({
    mode: 'history',
    linkExactActiveClass: 'active',
    routes: [
        {path: '/', redirect: {name: 'home'}},
        {path: '/dashboard', component: DashboardComponent, name: 'home', meta: {requiresAuth: true}},
        {path: '/tips', component: TipsComponent, meta: {requiresAuth: true}},
        {path: '/ranking', component: RankingComponent, meta: {requiresAuth: true}},
        {path: '/schedule', component: ScheduleComponent, meta: {requiresAuth: true}},
        {path: '/rules', component: RulesComponent, meta: {requiresAuth: true}},
        {path: '/login', component: LoginComponent, name: 'login', meta: {requiresNoAuth: true}},
        {path: '/signup', component: SignupComponent, meta: {requiresNoAuth: true}},
        {path: '/impress', component: ImpressComponent}
    ]
});

router.beforeEach((to, from, next) => {
    userService.getAuthPromise().then(user => {
        const loggedIn = !!user;
        if (!loggedIn && to.matched.some(record => record.meta.requiresAuth)) {
            next({name: 'login'});
        } else if (loggedIn && to.matched.some(record => record.meta.requiresNoAuth)) {
            next({name: 'home'});
        } else {
            next();
        }
    });
});

userService.getAuthObservable().subscribe(user => {
    const loggedIn = !!user;
    if (!loggedIn && router.currentRoute.matched.some(record => record.meta.requiresAuth)) {
        router.push({name: 'login'});
    } else if (loggedIn && router.currentRoute.matched.some(record => record.meta.requiresNoAuth)) {
        router.push({name: 'home'});
    }
});
