import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router'
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history'
// import { Router } from 'react-router-dom'
import createRoutes from './route';
import socket from './utils/socket';
import './index.css';
import App from './App';
import Login from './views/Login';
import * as serviceWorker from './serviceWorker';

socket.on('connect', () => {
    console.log('连接成功');
})
socket.on('disconnect', () => {
    console.log('连接断开了');
})
const history = createBrowserHistory();
const rootRoute = {
    component: App,
    indexRoute: { component: Login },
    childRoutes: createRoutes(),
};
console.log(createBrowserHistory(), createHashHistory(), createMemoryHistory())
// const a = ReactDOM.render(<App />, document.getElementById('root'));
// console.log('a', a);
ReactDOM.render(<Router history={history} routes={rootRoute} />, document.getElementById('root'))
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
