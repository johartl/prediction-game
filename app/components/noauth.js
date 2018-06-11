export default {
    inject: ['alertService'],
    mounted() {
        this.error = this.alertService.addError({
            header: 'Missing authorization',
            text: 'You are not authorized to view this content!',
            closeable: false
        });
    },
    beforeDestroy() {
        this.alertService.removeAlert(this.error);
    },
    template: `
    <div class="ui container noauth-component"></div>
    `
};
