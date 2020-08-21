// * Handles the action
function handler(data) {
    const s = data.message.split(' ').slice(1).join(' ');

    googleIt({ query: s })
        .then((results) => {
            const out = `${results[0].title} ${results[0].link}`;

            ipc.of.world.emit('message', {
                from: NICK,
                to: data.to,
                message: out,
                type: 'reply',
            });
        })
        .catch((e) => {
            console.log(`Error: ${e}`);
        });
}

// * Returns a lambda that decides when the handler should be fired
function trigger() {
    return (m) => (m.message.startsWith('!g')
                 || m.message.startsWith(m.client.nick));
}
// * imports
const ipc = require('node-ipc');
const dotenv = require('dotenv');
// import googleIt from 'google-it';
const googleIt = require('google-it');

dotenv.config();

const NICK = process.env.NICK || 'gb3';

ipc.config.id = NICK; // name the socket after the bot
ipc.config.retry = 1500;

ipc.connectToNet(
    'world',
    () => {
        function connect_callback() {
            ipc.log('## connected to world ##', ipc.config.delay);

            // .emit('message', 'hello');

            ipc.of.world.emit('message', {
                from: NICK,
                to: '#test',
                message: 'Google module connected',
                type: 'reply',
            });
        }

        ipc.of.world.on('connect', connect_callback);
        ipc.of.world.on('disconnect', () => ipc.log('disconnected from world'));
        ipc.of.world.on('!', handler);
    },
);
