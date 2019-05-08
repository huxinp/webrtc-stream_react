const Koa = require('koa')
const path = require('path')
const koaSend = require('koa-send')
const statiC = require('koa-static')
const socket = require('koa-socket')

const users = {} // 保存用户
const sockS = {} // 保存客户端对应的 socket
const io = new socket({
    ioOptions: {
        pingTimeout: 10000,
        pingTnterval: 5000,
    }
})

// 创建一个 Koa 对象表示 web app 本身:
const app = new Koa();
// socket 注入应用
io.attach(app);
app.use(statiC(path.join(__dirname, './public')));

// 对于任何请求, app 将调用该异步函数处理请求:
app.use(async (ctx, next) => {
    if (!/\./.test(ctx.request.url)) {
        await koaSend(
            ctx,
            'index.html',
            {
                root: path.join(__dirname, './'),
                maxage: 1000 * 60 * 60 * 24 * 7,
                gzip: true,
            } // eslint-disable-line
        )
    } else {
        await next();
    }
});
app._io.on('connection', sock => {
    sock.on('join', data => {
        sock.join(data.roomid, () => {
            if (!users[data.roomid]) {
                users[data.roomid] = [];
            }
            let obj = {
                account: data.account,
                id: sock.id
            };
            let arr = users[data.roomid].filter(v => v.account === data.account);
            if (!arr.length) {
                users[data.roomid].push(obj);
            }
            sockS[data.account] = sock;
            app._io.in(data.roomid).emit('joined', users[data.roomid], data.account, sock.id); // 发送给房间内所有人
            // sock.to(data.roomid).emit('joined', data.account);
        })
        console.log('\n join', Object.entries(data))
    })
    sock.on('offer', data => {
        console.log('\n offer', data)
        sock.to(data.roomid).emit('offer', data);
    });
    sock.on('answer', data => {
        console.log('\n answer', data);
        sock.to(data.roomid).emit('answer', data);
    });
    console.log('\n connection', Object.entries(sock.client), '\n');
})
app._io.on('disconnect', sock => {
    for (let k in users) {
        users[k] = users[k].filter(v => v.id !== sock.id)
    }
    console.log(`disconnect id => ${users}`, '\n')
});

app.listen(9003, () => {
    console.log('app started at prot 9003')
}).on('error', (e) => {
    console.log('app err: ', e);
})