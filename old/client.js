// * imports
const ipc = require('node-ipc');

ipc.config.id = 'gb3';
ipc.config.retry = 1500;

ipc.connectToNet(
    'world',
    () => {
        ipc.of.world.on(
            'connect',
            () => {
                ipc.log('## connected to world ##', ipc.config.delay);
                ipc.of.world.emit('message', 'hello');
            },
        );
        ipc.of.world.on(
            'disconnect',
            () => {
                ipc.log('disconnected from world');
            },
        );
        ipc.of.world.on(
            'message',
            (data) => {
                ipc.log('got a message from world : ', data);
            },
        );
    },
);

// // * trigger
// const global_trigger = (m) => m.startsWith('!');

//     console.log(`${from} => ${to}: ${message}`);

//     ipc.connectTo(
//         'gb3-google',
//         () => {
//             ipc.of.gb3.on(
//                 'hello',
//                 (data) => {
//                     ipc.log(data.debug);
//                     // if data was a string, it would have the color set to the debug style applied to it
//                 },
//             );
//         },
//     );

// // * server
// // ipc.serve(
// //   () => {
// //     ipc.server.on(
// //       'app.message',
// //       (data, socket) => {
// //         setTimeout(console.log, 50000, 'a a as');
// //         ipc.server.emit(socket, 'app.message',
// //           {
// //             id: ipc.config.id,
// //             message: `!g ${data.message}`,
// //           });
// //       },
// //     );
// //   },
// // );

// // ipc.server.start();
