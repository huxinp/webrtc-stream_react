import Dispatcher from '../dispatcher';
import axios from 'axios';
import api from '../api/api';

const _xhrs = {}
function ajax(key, url, data, type, success, failure) {
    let xhr = _xhrs[key]
    if (xhr) { xhr.abort() }
    _xhrs[key] = axios({
        url: url,
        data: type != 'GET' ? JSON.stringify(data) : data,
        type: type,
        processData: type == 'GET',
        contentType: 'application/json',
    }).then(success).catch(failure);
}

export default {
    init (id) {
        Dispatcher.execute('INIT_PENDING');
        ajax('INIT_USER_INFO', api.init, { id }, userInfo => {
            Dispatcher.execute('INIT_SUCCESS', { userInfo })
        }, () => {
            Dispatcher.execute('INIT_FAILED')
        })
    },
}