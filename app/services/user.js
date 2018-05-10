import api from './api';

const AUTH_STORAGE_KEY = 'auth';

class UserService {

    constructor() {
        this.user = null;
    }

    isLoggedIn() {
        return !!this.user;
    }

    getUser() {
        return this.user;
    }

    authenticate() {
        const token = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!token) {
            return Promise.reject();
        }
        return api.authenticate(token).then(({user, token}) => {
            this.storeAuthData(user, token);
            return user;
        }).catch(() => {
            this.clearAuthData();
            return Promise.reject();
        });
    }

    login(login, password) {
        return api.login({login, password}).then(({user, token}) => {
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
        api.setAuthToken(token);
        window.localStorage.setItem(AUTH_STORAGE_KEY, token);
    }

    clearAuthData() {
        this.user = null;
        api.setAuthToken(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
}

export default new UserService();
