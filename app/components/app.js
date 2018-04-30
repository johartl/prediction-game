import Vue from 'vue';

Vue.component('app', {
    template: `
    <div id="app-main">
        <nav-menu style="position: relative"></nav-menu>
        
        <div class="ui container segment">
          <router-view></router-view>
        </div>
    </div>
    `
});
