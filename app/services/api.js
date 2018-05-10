class Api {
    constructor() {
        this.apiBase = `${window.location.origin}/api`;
        this.authToken = null;
    }

    getRequestOptions() {
        const options = {
            credentials: 'same-origin',
            cache: 'no-cache',
            headers: new Headers()
        };
        options.headers.set('Content-Type', 'application/json');
        if (this.authToken) {
            options.headers.set('X-AUTH-TOKEN', this.authToken);
        }
        return options;
    }

    get(uri, options = this.getRequestOptions()) {
        options = Object.assign(options, {method: 'GET'});
        return fetch(`${this.apiBase}/${uri}`, options)
            .then(response => response.ok ? response.json() : Promise.reject(response));
    }

    post(uri, body, options = this.getRequestOptions()) {
        if (typeof body !== 'string') {
            body = JSON.stringify(body);
        }
        options = Object.assign(options, {method: 'POST', body});
        return fetch(`${this.apiBase}/${uri}`, options)
            .then(response => response.ok ? response.json() : Promise.reject(response));
    }

    login({login, password}) {
        return this.post('login', {login, password});
    }

    authenticate(token) {
        // Temporarily set X-AUTH-TOKEN
        const options = this.getRequestOptions();
        options.headers.set('X-AUTH-TOKEN', token);
        return this.get('auth', options);
    }

    setAuthToken(token) {
        this.authToken = token;
    }

    register({login, password}) {
        return this.post('register', {login, password});
    }

    getSchedule() {
        return this.get('schedule');
    }

    getUser(id) {
        return this.get(`user/${id}`);
    }
    getMatch(id) {
        return this.get(`match/${id}`);
    }

    getRanking() {
        return this.get('ranking');
    }
}

export default new Api();
