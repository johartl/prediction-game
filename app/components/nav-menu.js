import Vue from 'vue';

Vue.component('nav-menu', {
    inject: ['userService'],
    data: () => ({
        items: [],
        userSignedIn: false
    }),
    methods: {
        logout() {
            this.userService.logout();
        }
    },
    mounted() {
        this.subscription = this.userService.getAuthObservable().subscribe(user => {
            this.userSignedIn = !!user;
            this.items = [];
            if (user) {
                this.items.push(
                    {title: 'Dashboard', link: 'dashboard', icon: 'chart bar icon'},
                    {title: 'Ranking', link: 'ranking', icon: 'trophy icon'},
                    {title: 'Tips', link: 'tips', icon: 'pencil alternate icon'},
                    {title: 'Schedule', link: 'schedule', icon: 'calendar alternate outline icon'},
                    {title: 'Rules', link: 'rules', icon: 'book icon'}
                );
            }
            this.items.push(
                {title: 'Impress', link: 'impress', icon: 'info icon'}
            );
        });
    },
    beforeDestroy() {
        this.subscription.unsubscribe();
    },
    template: `
    <div class="ui huge menu fixed">
        
        <router-link to="/" tag="div" class="header item" style="cursor: pointer">
        Tip match 2018
        </router-link>

        <router-link v-for="item in items" v-bind:to="item.link" :key="item.link" class="item">
            <i v-if="item.icon" v-bind:class="item.icon"></i>
            {{item.title}}
        </router-link>

        <div class="right menu" v-if="!userSignedIn">
            <div class="item">
                <router-link to="login" class="ui button icon">
                    <i class="sign in icon"></i>
                    Log in
                </router-link>
            </div>
            <div class="item">
                <router-link to="signup" class="ui button primary icon">
                    <i class="signup icon"></i>
                    Sign up
                </router-link>
            </div>
        </div>
        
        <div class="right menu" v-if="userSignedIn">
            <div class="item">
                <button class="ui button icon" v-on:click="logout">
                    Log out
                    <i class="sign out icon"></i>
                </button>
            </div>
        </div>
    </div>
    `
});
