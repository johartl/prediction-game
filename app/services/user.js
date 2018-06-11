import {ReplaySubject} from 'rxjs/ReplaySubject'

import {apiService} from './api';

const AUTH_STORAGE_KEY = 'auth';

class UserService {

    constructor() {
        this.user = null;
        this.authStatusSubject = new ReplaySubject(1);
    }

    isLoggedIn() {
        return !!this.user;
    }

    getUser() {
        return this.user;
    }

    getAuthObservable() {
        return this.authStatusSubject.asObservable();
    }

    getAuthPromise() {
        return this.getAuthObservable().first().toPromise();
    }

    authenticate() {
        const token = window.localStorage.getItem(AUTH_STORAGE_KEY);
        const authCall = token ? apiService.authenticate(token) : Promise.reject();

        return authCall.then(({user, token}) => {
            this.storeAuthData(user, token);
            return user;
        }).catch(() => {
            this.clearAuthData();
            return Promise.reject();
        });
    }

    login(login, password) {
        return apiService.login({login, password}).then(({user, token}) => {
            this.storeAuthData(user, token);
            return user;
        }).catch(error => {
            this.clearAuthData();
            return Promise.reject(error);
        });
    }

    logout() {
        this.clearAuthData();
    }

    storeAuthData(user, token) {
        this.user = user;
        apiService.setAuthToken(token);
        window.localStorage.setItem(AUTH_STORAGE_KEY, token);
        this.authStatusSubject.next(user);
    }

    clearAuthData() {
        this.user = null;
        apiService.setAuthToken(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        this.authStatusSubject.next(false);
    }

    checkRoles(roles) {
        return this.isLoggedIn() && !roles.some(role => !this.user.roles.includes(role));
    }

    isAdmin() {
        return this.checkRoles(['admin']);
    }
}

export const userService = new UserService();
