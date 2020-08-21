const ipc = require('node-ipc');
const dotenv = require('dotenv');
const { exec } = require('child_process');

dotenv.config();

const NICK = process.env.NICK || 'gb3';

ipc.config.id = NICK; // name the socket after the bot
ipc.config.retry = 1500;

// * Handles the action
function handler(data) {
    if (data.message.startsWith('!fortune')) {
        exec('fortune -s', (err, stdout, stderr) => {
            if (err) {
                // some err occurred
                // client.say(to, err);
                console.error(err);
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);

                message = stdout.replace(/\n/g, ' ');
                ipc.of.world.emit('message', {
                    from: NICK,
                    to: data.to,
                    message,
                    type: 'reply',
                });
            }
        });
    }
}

ipc.connectToNet(
    'world',
    () => {
        function connect_callback() {
            ipc.log('## connected to world ##', ipc.config.delay);

            // .emit('message', 'hello');
        }

        ipc.of.world.on('connect', connect_callback);
        ipc.of.world.on('disconnect', () => ipc.log('disconnected from world'));
        ipc.of.world.on('!', handler);
    },
);
