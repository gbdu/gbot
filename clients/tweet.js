const ipc = require('node-ipc');
const dotenv = require('dotenv');

const Twitter = require('twitter');

dotenv.config();

const twitter = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const NICK = process.env.NICK || 'gb3';
const DEBUG_CHAN = process.env.DEBUG_CHAN || '#test';

ipc.config.id = NICK; // name the socket after the bot
ipc.config.retry = 1500;
let poll = new Map();
let poll_text = '';

// * Handles the action
function handler(data) {
    if (data.message.startsWith('!tweet') && poll_text == '') {
        const twxt = data.message.split(' ').slice(1).join(' ');
        poll_text = twxt;

        if (data.from == 'gargantua' || data.from == 'toraton') {
            twitter.post('statuses/update', { status: poll_text })
                .then((tweet) => {
                    ipc.of.world.emit('message', {
                        from: NICK,
                        to: data.to,
                        message: 'Message tweeted! https://twitter.com/codelove10/',
                        type: 'reply',
                    });
                });
            poll_text = '';
        } else {
            ipc.of.world.emit('message', {
                from: NICK,
                to: data.to,
                message: `Is this a worthy tweet? '${poll_text}' Vote with !yes or !no`,
                type: 'reply',
            });
        }
    }
    console.log(data.from);
    if (data.message.startsWith('!rt') && data.from == 'gargantua') {
        const w = data.message.split('/');
        const last = w[w.length - 1];

        // ipc.of.world.emit('message', {
        //     from: NICK,
        //     to: data.to,
        //     message: `retweeting ${last}`,
        //     type: 'reply',
        // });

        console.log(last);
        const params = {
            q: last,

        };
        twitter.get('search/tweets', params, (err, d) => {
            if (!err) {
                console.log(d.statuses[0].retweeted_status.id_str);

                console.log();

                console.log();

                console.log();

                console.log();

                console.log();

                console.log();
                console.log();
                const tweet_id = d.statuses[0].retweeted_status.id_str;
                if (tweet_id) {
                    twitter.post('statuses/retweet/:id/', {
                        id: tweet_id,
                    }, (err, response) => {
                        if (response) {
                            console.log(response);
                            // ipc.of.world.emit('message', {
                            //     from: NICK,
                            //     to: data.to,
                            //     message: response,
                            //     type: 'reply',
                            // });
                        }
                        if (err) {
                        // ipc.of.world.emit('message', {
                        //     from: NICK,
                        //     to: data.to,
                        //     message: 'Problem when retweeting. Possibly already retweeted this tweet!',
                        //     type: 'reply',
                        // });
                        }
                    });
                }
            } else {
                console.log('Error during tweet search call');
            }
        });
    }
    if (data.message.startsWith('!yes') || data.message.startsWith('!no') || data.message.startsWith('!ay') || data.message.startsWith('!nay')) {
        console.log(`tweet: ${poll_text}`);
        if (poll_text == '') {
            ipc.of.world.emit('message', {
                from: NICK,
                to: data.to,
                message: "There's no poll going on. Suggest a tweet with with !tweet <text>",
                type: 'reply',
            });
        } else {
            poll.set(data.from_host, data.message[1] == 'y' ? 1 : 0);
            // ipc.of.world.emit('message', {
            //     from: NICK,
            //     to: data.to,
            //     message: 'Your vote has been registered',
            //     type: 'reply',
            // });

            let yes = 0;
            let no = 0;

            for (const v of poll.entries()) {
                if (v[1]) {
                    yes++;
                } else {
                    no++;
                }
            }

            if (yes >= 3) {
                twitter.post('statuses/update', { status: poll_text })
                    .then((tweet) => {
                        ipc.of.world.emit('message', {
                            from: NICK,
                            to: data.to,
                            message: 'Message tweeted! https://twitter.com/codelove10/',
                            type: 'reply',
                        });
                    });

                poll_text = '';
                poll = new Map();
            } else if (no >= 3) {
                poll_text = '';
                poll = new Map();
                ipc.of.world.emit('message', {
                    from: NICK,
                    to: data.to,
                    message: 'Tweet canceled.',
                    type: 'reply',
                });
            }
        }
    }

    twitter.get('statuses/user_timeline', { count: 1 }, (error, tweets, response) => {
    // if(error) throw error;
        console.log(tweets[0].created_at); // The favorites.
    //    console.log(response);  // Raw response object.
    });
}

ipc.connectToNet(
    'world',
    () => {
        function connect_callback() {
            ipc.log('## connected to world ##', ipc.config.delay);

            // .emit('message', 'hello');

            // ipc.of.world.emit('message', {
            //     from: NICK,
            //     to: DEBUG_CHAN,
            //     message: 'Twitter module connected',
            //     type: 'reply',
            // });
        }

        ipc.of.world.on('connect', connect_callback);
        ipc.of.world.on('disconnect', () => ipc.log('disconnected from world'));
        ipc.of.world.on('!', handler);
    },
);
