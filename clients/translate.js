const ipc = require('node-ipc');
const dotenv = require('dotenv');
const ps = require('child_process');

dotenv.config();

const NICK = process.env.NICK || 'gb3';

ipc.config.id = NICK; // name the socket after the bot
ipc.config.retry = 1500;

function handler(data) {
    if (data.message.startsWith('!tr')) {
        try {
            const words = data.message.split(' ');
            let lang;
            let text;

            if (/^:[a-z]{2}$/.test(words[1])) {
                lang = words[1];
                text = words.slice(2);
            } else {
                lang = ':en';
                text = words.slice(1);
            }

            text = text.join(' ').replace('-', '~');
            text = text.replace('://', '~');

            const child = ps.spawn('trans', ['--brief', lang, '--', text]);

            child.on('error', (err) => {
                console.log(err);
            });

            child.stdout.on('data', (d) => {
                console.log({
                    from: NICK,
                    to: data.to,
                    message: d.toString(),
                    type: 'reply',
                });
                ipc.of.world.emit('message', {
                    from: NICK,
                    to: data.to,
                    message: d.toString(),
                    type: 'reply',
                });
            });
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log(data);
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
