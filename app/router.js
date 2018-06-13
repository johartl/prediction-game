import Vue from 'vue';
import VueRouter from 'vue-router';

import {userService} from './services/user';
import {default as PredictionComponent} from 'components/prediction';
import {default as RankingComponent} from 'components/ranking';
import {default as ScheduleComponent} from 'components/schedule';
import {default as RulesComponent} from 'components/rules';
import {default as ProfileComponent} from 'components/profile';
import {default as MatchComponent} from 'components/match';
import {default as LoginComponent} from 'components/login';
import {default as SignupComponent} from 'components/signup';
import {default as DashboardComponent} from 'components/dashboard';
import {default as AdminComponent} from 'components/admin';
import {default as NoAuthComponent} from 'components/noauth';

Vue.use(VueRouter);

export const router = new VueRouter({
    mode: 'history',
    linkExactActiveClass: 'active',
    routes: [
        {path: '/', redirect: {name: 'home'}},
        // {path: '/dashboard', component: DashboardComponent, name: 'home', meta: {requiresAuth: true}},
        {path: '/prediction', component: PredictionComponent, name: 'home', meta: {requiresAuth: true}},
        {path: '/ranking', component: RankingComponent, meta: {requiresAuth: true}},
        {path: '/schedule', component: ScheduleComponent, meta: {requiresAuth: true}},
        {path: '/rules', component: RulesComponent, meta: {requiresAuth: true}},
        {path: '/profile/:id', component: ProfileComponent, name: 'profile', meta: {requiresAuth: true}},
        {path: '/match/:id', component: MatchComponent, name: 'match', meta: {requiresAuth: true}},
        {path: '/login', component: LoginComponent, name: 'login', meta: {requiresNoAuth: true}},
        {path: '/signup', component: SignupComponent, meta: {requiresNoAuth: true}},
        {path: '/admin', component: AdminComponent, meta: {requiresAuth: true, requiresRoles: ['admin']}},
        {path: '/no-authorization', component: NoAuthComponent, name: 'noauth'}
    ]
});

router.beforeEach((to, from, next) => {
    userService.getAuthPromise().then(user => {
        const loggedIn = !!user;
        const requiredRoles = to.matched.reduce(((roles, record) => {
            return roles.concat(record.meta.requiresRoles || []);
        }), []);

        if (!loggedIn && to.matched.some(record => record.meta.requiresAuth)) {
            next({name: 'login'});
        } else if (loggedIn && to.matched.some(record => record.meta.requiresNoAuth)) {
            next({name: 'home'});
        } else if (requiredRoles.length > 0 && !userService.checkRoles(requiredRoles)) {
            next({name: 'noauth'});
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
