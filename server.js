const ipc = require('node-ipc');
const dotenv = require('dotenv');
// const chokidar = require('chokidar');

const ps = require('child_process');
const fs = require('fs');

dotenv.config();

const NICK = process.env.NICK || 'gb3';

ipc.config.id = NICK;
ipc.config.retry = 1500;
ipc.config.maxConnections = 50;

const util = require('util');

const log_file = fs.createWriteStream('debug.log', { flags: 'w' });
const log_stdout = process.stdout;

console.log = function (d) { //
    log_file.write(`${util.format(d)}\n`);
    log_stdout.write(`${util.format(d)}\n`);
};

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

// * TODO Manage module sub processes
function add_module(filename) {
    console.log(`adding ${filename}`);

    function launch(m) {
        if (m.err) {
            console.log(m.err);
        } else {
            console.log(m.stdout);
        }
    }

    console.log(ps.exec(`node ./${filename}`, launch));
}

// Initialize watcher.
// const watcher = chokidar.watch('clients/', { persistent: true });

// // Add event listeners.
// watcher
//     .on('add', add_module)
//     .on('change', (path) => console.log(`File ${path} has been changed`))
//     .on('unlink', (path) => console.log(`File ${path} has been removed`));

// * Handle error
ipc.server.on('error', (err) => ipc.log('Got an ERROR!', err));

// * Start server
ipc.server.start();
