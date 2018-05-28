import Vue from 'vue';

Vue.component('alert', {
    inject: ['alertService'],
    data: () => ({
        alerts: []
    }),
    mounted() {
        this.subscription = this.alertService.getAlertObservable().subscribe(alerts => {
            this.alerts = alerts;
        });
    },
    beforeDestroy() {
        this.subscription.unsubscribe();
    },
    methods: {
        dismissAlert(id) {
            this.alertService.removeAlert(id);
        }
    },
    template: `
    <div class="ui container alert-component" v-if="alerts.length > 0">
        <div v-for="alert in alerts" class="ui message" v-bind:class="{'icon': alert.icon, [alert.type]: true}">
            <i class="close icon" v-on:click="dismissAlert(alert.id)"></i>
            <i v-if="alert.icon" v-bind:class="alert.icon"></i>
            <div class="content">

                <div class="header" v-if="alert.header">
                    {{ alert.header }}
                </div>
                <p>{{ alert.text }}</p>
            </div>
        </div>
    </div>
    `
});
