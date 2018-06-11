export default {
    inject: ['apiService', 'alertService', 'userService'],
    data: () => ({
        username: '',
        passwordA: '',
        passwordB: '',
        loading: false,
        error: false
    }),
    mounted() {
        this.alerts = [];
    },
    methods: {
        signup() {
            if (!this.validateSignup()) {
                return;
            }
            const login = this.username;
            const password = this.passwordA;

            this.apiService.register({login, password}).then(() => {
                this.alertService.addSuccess({
                    text: `Your account has been successfully created. You will be logged in automatically in 5 seconds.`
                }, 5000);
                setTimeout(() => this.userService.login(login, password), 5000);
            }).catch(({code, error}) => {
                this.alerts.push(this.alertService.addError({
                    text: `Unable to complete registration: ${error} (${code}).`
                }));
            });
        },
        validateSignup() {
            this.alerts.splice(0, this.alerts.length).forEach(alertId => this.alertService.removeAlert(alertId));

            if (!this.username || !this.passwordA || !this.passwordB) {
                this.alerts.push(this.alertService.addError({
                    text: 'Please specify all required fields.'
                }));
            } else if (this.username.length < 3) {
                this.alerts.push(this.alertService.addError({
                    text: 'The username must be at least 3 characters long.'
                }));
            } else if (this.passwordA.length < 5) {
                this.alerts.push(this.alertService.addError({
                    text: 'The password must be at least 5 characters long.'
                }));
            } else if (this.passwordA !== this.passwordB) {
                this.alerts.push(this.alertService.addError({
                    text: 'The passwords do not match.'
                }));
            } else {
                return true;
            }
            return false;
        }
    },
    template: `
    <form class="ui container large form" v-on:submit.prevent="signup">
        <div class="ui segment">
            <h1 class="ui header">Create new account</h1>
            <p>Please fill out the following fields.</p>
            <div class="required field">
                <label>Username</label>
                <div class="ui large input left icon">
                    <i class="user icon"></i>
                    <input name="username" v-model="username" type="text" 
                           placeholder="Username" autocomplete="username">  
                </div>
            </div>
            <div class="required field">
                <label>Password</label>
                <div class="ui large input left icon">
                    <i class="lock icon"></i>
                    <input name="password-a" v-model="passwordA" 
                           type="password" placeholder="Password" autocomplete="new-password">
                </div>
            </div>
            <div class="required field">
                <label>Password (repeated)</label>
                <div class="ui large input left icon">
                    <i class="lock icon"></i>
                    <input name="password-a" v-model="passwordB" type="password" placeholder="Password">
                </div>
            </div>

            <div class="field centered center">
            <button class="ui fluid large teal submit button" type="submit"
                    v-bind:class="{'loading': loading, 'negative': error}">
                Sign up
            </button>
            </div>
        </div>
    </form>
    `
};
