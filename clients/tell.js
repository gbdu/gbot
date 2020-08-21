const ipc = require('node-ipc');
const dotenv = require('dotenv');
const googleIt = require('google-it');
const { duckIt } = require('node-duckduckgo');

dotenv.config();

const NICK = process.env.NICK || 'gb3';

ipc.config.id = NICK; // name the socket after the bot
ipc.config.retry = 1500;

// * Handles the action
function handler(data) {

}

ipc.connectToNet(
    'world',
    () => {
        function connect_callback() {
            ipc.log('## connected to world ##', ipc.config.delay);

            // .emit('message', 'hello');

            ipc.of.world.emit('message', {
                from: NICK,
                to: '#test',
                message: 'DDG module connected',
                type: 'reply',
            });
        }

        ipc.of.world.on('connect', connect_callback);
        ipc.of.world.on('disconnect', () => ipc.log('disconnected from world'));
        ipc.of.world.on('!', handler);
    },
);
