const irc = require('irc');
const redis = require('redis');
const dotenv = require('dotenv');

function init_config() {
    const result = dotenv.config();

    if (result.error) {
        console.log('No .env file found');
        process.exit(1);
    }

    return result;
}

function init_db() {
    const rclient = redis.createClient(process.env.REDIS_SERVER, { password: process.env.REDIS_PASSWORD });

    rclient.on('error', (error) => {
        console.error(error);
    });

    rclient.set('key', 'value', redis.print);
    rclient.get('key', redis.print);
 
    return rclient;
}

function init_irc() {
    // Setup irc client with info from .env
    const client = new irc.Client(
        process.env.SERVER || 'irc.slashnet.org',
        process.env.NICK || 'gb3', {
            channels: [process.env.CHANNELS] || ['#test'],
            userName: process.env.NICK || 'gb3',
            port: process.env.PORT || 6667,
            password: process.env.PASSWORD,
            debug: !process.env.QUIET,
            showErrors: !process.env.QUIET,
        },
    );

    return client;
}

exports.init_config = init_config;
exports.init_db = init_db;
exports.init_irc = init_irc;
