// * imports
const ipc = require('node-ipc');
const irc = require('irc');

ipc.config.id = 'gb3';
ipc.config.retry = 1500;

// * trigger
const global_trigger = (m) => m.startsWith('!');

// * irc
function init_irc() {
    // Setup irc client with info from .env
    const client = new irc.Client(
        process.env.SERVER || 'irc.slashnet.org',
        process.env.NICK || 'gb3', {
            channels: [process.env.CHANNELS] || ['#test'],
            userName: process.env.NICK || 'gb3',
            password: process.env.PASSWORD,
            debug: !process.env.QUIET,
            showErrors: !process.env.QUIET,
        },
    );

    return client;
}

const client = init_irc();

client.addListener('message', (from, to, message) => {
    console.log(`${from} => ${to}: ${message}`);

    ipc.connectTo(
        'gb3-google',
        () => {
            ipc.of.gb3.on(
                'hello',
                (data) => {
                    ipc.log(data.debug);
                    // if data was a string, it would have the color set to the debug style applied to it
                },
            );
        },
    );
});

// * server
// ipc.serve(
//   () => {
//     ipc.server.on(
//       'app.message',
//       (data, socket) => {
//         setTimeout(console.log, 50000, 'a a as');
//         ipc.server.emit(socket, 'app.message',
//           {
//             id: ipc.config.id,
//             message: `!g ${data.message}`,
//           });
//       },
//     );
//   },
// );

// ipc.server.start();
