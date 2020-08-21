// * imports
const ipc = require('node-ipc');
const irc = require('irc');
const dotenv = require('dotenv');

dotenv.config();

const NICK = process.env.NICK || 'gb3';
const SERVER = process.env.SERVER || 'irc.slashsnet.org';
let client;

ipc.config.id = NICK; // name the socket after the bot

ipc.config.retry = 1500;

function run_irc(world) {
    client = new irc.Client(SERVER, NICK, {
        channels: [process.env.CHANNELS] || ['#test'],
        userName: process.env.NICK || 'gb3',
        password: process.env.PASSWORD,
        debug: !process.env.QUIET,
        showErrors: !process.env.QUIET,
    });

    // * listener
    const lastmsg = '';
    client.addListener('message', (from, to, message) => {
        // log_msg(`${from} => ${to}: ${message}`);
        // only send messages that start with ! to server
        if (message.startsWith('!')) {
            world.emit('!', { from, to, message });
        }
    });
}

function callback() {
    function connect_callback() {
        ipc.log('## connected to world ##', ipc.config.delay);
        run_irc(ipc.of.world);
    }
    function disconnect_callback() {
        client.disconnect('No connection to process supervisor');
        ipc.log('disconnected from world');
    }
    function message_callback(data) {
        ipc.log('got a message from world : ', data);
        if (data.from == NICK && data.type == 'reply') {
        // a module wants us to send this to IRC
            data.type = '';
            client.say(data.to, data.message);
        } else if (data.message.startsWith('!')) {
            ipc.of.world.emit('!', data);
        }
    }

    // register callbacks
    ipc.of.world.on('connect', connect_callback);
    ipc.of.world.on('disconnect', disconnect_callback);
    ipc.of.world.on('message', message_callback);
}

ipc.connectToNet('world', callback);
