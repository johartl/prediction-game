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
            .then(this.handleResponse.bind(this));
    }

    post(uri, body, options = this.getRequestOptions()) {
        if (typeof(body) !== 'string') {
            body = JSON.stringify(body);
        }
        options = Object.assign(options, {method: 'POST', body});
        return fetch(`${this.apiBase}/${uri}`, options)
            .then(this.handleResponse.bind(this));
    }

    put(uri, body, options = this.getRequestOptions()) {
        if (typeof(body) !== 'string') {
            body = JSON.stringify(body);
        }
        options = Object.assign(options, {method: 'PUT', body});
        return fetch(`${this.apiBase}/${uri}`, options)
            .then(this.handleResponse.bind(this));
    }

    handleResponse(response) {
        if (response.ok) {
            return response.json();
        }
        return response.json()
            .catch(() => ({code: 900, error: 'Unknown error', response}))
            .then(error => Promise.reject(error));
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

    getProfile(id=null) {
        if (id) {
            return this.get(`profile/${id }`);
        } else {
            return this.get(`profile`);
        }
    }

    getPredictions(id=null) {
        if (id) {
            return this.get(`predictions/${id }`);
        } else {
            return this.get(`predictions`);
        }
    }

    updatePredictions(predictions) {
        return this.put('predictions', predictions);
    }

    getMatch(id) {
        return this.get(`match/${id}`);
    }

    submitMatchResult(id, scoreA, scoreB) {
        return this.put(`match/${id}/result`, {score_a: scoreA, score_b: scoreB});
    }

    getRanking() {
        return this.get('ranking');
    }

    getTeams() {
        return this.get('teams');
    }
}

export const apiService = new Api();
