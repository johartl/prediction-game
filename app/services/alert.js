import {ReplaySubject} from 'rxjs/ReplaySubject';

class AlertService {
    constructor() {
        this.globalAlertId = 0;
        this.alertMap = new Map();
        this.timeoutMap = new Map();
        this.alertSubject = new ReplaySubject(1);
        this.triggerChange();
    }

    addAlert({type, text, header, icon}, timeout=null) {
        const id = this.globalAlertId++;
        this.alertMap.set(id, {id, type, text, header, icon});
        if (timeout) {
            const timeoutCall = setTimeout(() => this.removeAlert(id), timeout);
            this.timeoutMap.set(id, timeoutCall);
        }
        this.triggerChange();
        return id;
    }

    addInfo(options={}, timeout=null) {
        return this.addAlert({type: 'info', ...options}, timeout);
    }

    addError(options={}, timeout=null) {
        return this.addAlert({type: 'negative', ...options}, timeout);
    }

    addSuccess(options={}, timeout=null) {
        return this.addAlert({type: 'positive', ...options}, timeout);
    }

    removeAlert(id) {
        if (!this.alertMap.has(id)){
            return;
        }
        this.alertMap.delete(id);
        if (this.timeoutMap.has(id)) {
            clearTimeout(this.timeoutMap.get(id));
            this.timeoutMap.delete(id);
        }
        this.triggerChange();
    }

    getAlerts() {
        return Array.from(this.alertMap.values());
    }

    getAlertObservable() {
        return this.alertSubject.asObservable();
    }

    triggerChange() {
        this.alertSubject.next(this.getAlerts());
    }
}

export const alertService = new AlertService();
