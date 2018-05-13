import Vue from 'vue';

Vue.component('app', {
    inject: ['userService'],
    mounted() {
        this.userService.authenticate().then(() => {
            console.debug('User authenticated');
        }).catch(() => {
            console.debug('User not authenticated');
        });
    },
    template: `
    <div id="app-main">
        <nav-menu style="position: relative"></nav-menu>
        <alert></alert>
        
        <div id="content">
            <router-view></router-view>
        </div>
    </div>
    `
});
