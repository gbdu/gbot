// * imports
const ipc = require('node-ipc');
const irc = require('irc');
const dotenv = require('dotenv');
const Discord = require('discord.js');

const bot = new Discord.Client();

dotenv.config();

const NICK = process.env.NICK || 'gb3';

ipc.config.id = NICK; // name the socket after the bot

ipc.config.retry = 1500;

function run_irc(world) {
    bot.login(process.env.DISCORD_TOKEN);

    bot.on('message', (msg) => {
        if (msg.content.startsWith('!')) {
            const message = {
                message: msg.content,
                from: msg.author.username,
                to: msg.channel.name,
            };
            console.log(message);
            world.emit('!', message);
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
            //            client.say(data.to, data.message);
            //          bot.channels.get('#codelove').send('Hello here!');
            const channel = bot.channels.cache.find((channel) => channel.name === data.to);
            channel.send(data.message);
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
