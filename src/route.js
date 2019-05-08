
import Login from './views/Login';
import Whiteboad from './views/Whiteboad';

export default function createRoutes() {
    
    const loadModule = (cb) => (componentModule) => {
        cb(null, componentModule.default);
    };
    return [
        {
            path: '/',
            name: 'Login',
            component: Login,
            // getComponent(location, callback) {
            //     console.trace('Login');
            //     import('./views/Login').then(component => loadModule(callback)(component))
            // },
            onEnter() { console.log('onEnter') },
            onLeave() { console.log('onLeave') }
        },
        {
            path: '/whiteboad',
            name: 'Whiteboad',
            component: Whiteboad,
            // getComponent(location, callback) {
            //     console.trace('Whiteboad')
            //     import('./views/Whiteboad').then(component => loadModule(callback)(component))
            // },
            onEnter() { console.log('onEnter') },
            onLeave() { console.log('onLeave') }
        }
    ];
}
