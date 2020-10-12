const fs = require('fs');

const init = require('./init')

const result = init.init_config();
const db = init.init_db();
const subscriber_db = db.duplicate();
const client = init.init_irc();

// TODO move these to seperate modules
const handle_fortune = require('./handlers/handle_fortune');
const handle_translate = require('./handlers/handle_translate');


let lastmsg = '';

const commands = [
    {
        trigger: (message) => (message.startsWith('!fortune')),
        handler: handle_fortune,
    },
    {
        trigger: (message) => (message.startsWith('!t') && !message.startsWith('!tell')),
        handler: handle_translate,
    },
    {
        trigger: (message) => (message.startsWith('!last')),
        handler: handle_last,
    },
];

function handle_last({ to, db, client }) {
    const log = db.lrange(to, 0, -1, (err, replies) => {
        // const child = exec("echo  | curl -F 'f:1=<-' ix.io", (err, stdout, stderr) => {
        //     console.log(stdout);
        // });

        const lastlog = fs.createWriteStream('lastlog');

        replies.forEach((r) => {
            lastlog.write(`${r}\n`);
        });

        // exec('./upload_last.sh', (err, stdout, stderr) => {
        //     if (stdout) {
        //         client.say(to, stdout);
        //     }
        // });
    });
}


subscriber_db.on("message", function(channel, msg){
    msg = JSON.parse(msg);
    console.log(msg);
    if(msg.from == client.nick){
        client.say(msg.to, msg.message);
    }
});

// subscriber_db.psubscribe("pmessage");
subscriber_db.subscribe("msg");

client.addListener('message', (from, to, message) => {
    if (!process.env.QUIET) {
        console.log(`${from} => ${to}: ${message}`);
        const timestamp = new Date().toUTCString();

        db.rpush(to, `[${timestamp}] ${from}: ${message}`);
        db.publish("msg", JSON.stringify({to, from, message, type:"irc"}));
    }

    commands.forEach((c) => {
        if (c.trigger(message)) {
            c.handler({
                from, to, message, db, client, lastmsg,
            });
        }
    });

    lastmsg = message;
});

client.addListener('join', (channel, who) => {
    // db.find({ to: who }, function (err, docs) {
    //   docs.forEach(d => {
    //     client.say(channel, d.to + ": " + d.from + " wanted you to know: " + d.content + " [ on " + d.time + " ]" );
    //     db.remove({ _id: d._id }, {}, function (err, numRemoved) {
    //       console.log(numRemoved);
    //     });
    //   }
    //   );

    //   });

});

client.addListener('error', (message) => {
    console.log('error: ', message);
});

// const express = require('express');

// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//     res.send(req.query.channel);
// });

// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`);
// });
