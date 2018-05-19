export default {
    inject: ['userService', 'alertService'],
    data: () => ({
        username: '',
        password: '',
        loading: false,
        error: false
    }),
    mounted() {
        this.errorAlert = null;
    },
    methods: {
        login() {
            this.loading = true;
            this.error = false;
            this.alertService.removeAlert(this.errorAlert);
            this.userService.login(this.username, this.password).catch(() => {
                this.error = true;
                this.errorAlert = this.alertService.addError({text: 'Username and password are not correct.'}, 5000);
            }).finally(() => {
                this.loading = false;
            })
        }
    },
    template: `
    <div class="ui grid center aligned middle aligned">
        <div class="column" style="max-width: 400px;">
            <form class="ui large form" v-on:submit.prevent="login">
                <div class="ui segment">
                    <div class="field">
                        <div class="ui large input left icon">
                            <i class="user icon"></i>
                            <input name="username" v-model="username" 
                                   type="text" placeholder="Username" autocomplete="username">  
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui large input left icon">
                            <i class="lock icon"></i>
                            <input name="password" v-model="password" 
                                   type="password" placeholder="Password" autocomplete="current-password">
                        </div>
                    </div>
        
                    <div class="field centered center">
                    <button class="ui fluid large teal submit button" type="submit"
                            v-bind:class="{'loading': loading, 'negative': error}">
                        Login
                    </button>
                    </div>
                </div>
            </form>
            
            <div class="ui message">
                Not registered yet? 
                &nbsp;  
                <router-link to="signup">Sign up now!</router-link>
            </div>
        </div>
    </div>
    `
};
