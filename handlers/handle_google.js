const googleIt = require('google-it');

export default function handle_google({ message, to, client }) {
    const s = message.split(' ').slice(1).join(' ');

    googleIt({ query: s })
        .then((results) => {
            client.say(to, `${results[0].title} ${results[0].link}`);

            if (message.startsWith('!gg')) {
                client.say(to, `Result 2: ${results[1].title} ${results[1].link}`);
                client.say(to, `Result 3: ${results[2].title} ${results[2].link}`);
            }
        })
        .catch((e) => {
            console.log(`Error: ${e}`);
            // client.say(to, e);
        });
}

// exports.handle_google = handle_google ;
