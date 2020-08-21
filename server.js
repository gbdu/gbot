const ipc = require('node-ipc');
const dotenv = require('dotenv');

dotenv.config();

const NICK = process.env.NICK || 'gb3';

ipc.config.id = NICK;
ipc.config.retry = 1500;
ipc.config.maxConnections = 50;

ipc.serveNet(
    () => {
        ipc.server.on(
            'message',
            (data, socket) => {
                ipc.log('got a message : ', data);
                ipc.server.broadcast('message', data);
            },
        );
        ipc.server.on(
            '!',
            (data, socket) => {
                ipc.log('got a ! : ', data);
                ipc.server.broadcast('!', data);
            },
        );

        ipc.server.on(
            'socket.disconnected',
            function (data, socket) {
                console.log('DISCONNECTED\n\n', arguments);
            },

        );
    },
);

ipc.server.on('error', (err) => ipc.log('Got an ERROR!', err));

ipc.server.start();
