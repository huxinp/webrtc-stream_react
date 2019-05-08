import { Dispatcher } from 'flux';

export default Object.assign(new Dispatcher(), {
    execute: function (type, data) {
        this.dispatch({ type, data });
    }
});