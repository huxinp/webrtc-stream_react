import EventEmitter from 'events'
import Dispatcher from '../dispatcher';

let _status = 0;
let _started = false;
let _myself = {};

const AppStore = Object.assign(new EventEmitter(), {
    getStatus: () => _status,
    getMyself: () => _myself
});

const _emit = () => AppStore.emit('UPDATE');

Dispatcher.register(payload => {
    switch(payload.type) {
        case 'INIT_PENDING':
            _status = 1;
            _emit();
            break;
        case 'INIT_SUCCESS':
            _myself = Object.assign({}, _myself, {
                userInfo, payload.data.userInfo,
            });
            _status = 0;
            _emit();
            break;
        case 'INIT_FAILED':
            _status = -1;
            _emit();
            break;
        default: 
            console.log('payload', payload)
    }
});

export default AppStore;