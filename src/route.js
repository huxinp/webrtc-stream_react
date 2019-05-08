
export default function createRoutes() {
    return [
        {
            path: '/',
            name: 'Whiteboad',
            getComponent(location, callback) {
                console.trace('Whiteboad')
                import('./views/Whiteboad').then(componentModule => {
                    callback(null, componentModule.default);
                })
            },
            onEnter() { console.log('onEnter')},
            onLeave() { console.log('onLeave')}
        }
    ];
}
