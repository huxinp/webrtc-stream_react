import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router'
import { createBrowserHistory } from "history";
import createRoutes from './route';
import socket from './utils/socket';
import './index.css';
import App from './App';
import Whiteboad from './views/Whiteboad';
import * as serviceWorker from './serviceWorker';

socket.on('connect', () => {
    console.log('连接成功');
})
socket.on('disconnect', () => {
    console.log('连接断开了');
})
const history = createBrowserHistory();
const rootRoute = [{
    path: '/',
    component: App,
    indexRoute: { component: Whiteboad },
    childRoutes: createRoutes(),
}];

console.log('App', App);
console.log('Whiteboad', Whiteboad);
// ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Router routes={rootRoute} history={history} />, document.getElementById('root'))
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
