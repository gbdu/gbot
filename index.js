
import handle_google from './handlers/handle_google';
import handle_fortune from './handlers/handle_fortune';
import handle_tell from './handlers/handle_tell';
import handle_translate from './handlers/handle_translate';

import {init_config, init_db, init_irc} from './init';

var result = init_config();
var db = init_db();
var client = init_irc();

var lastmsg = "";

let commands = [
  {
    trigger: message => (message.startsWith("!g") ||
                         message.startsWith(client.nick)),
    handler: handle_google,
  },
  {
    trigger: message => (message.startsWith("!fortune")),
    handler: handle_fortune,
  },
  {
    trigger: message => (message.startsWith("!tell")),
    handler: handle_tell,
  },
  {
    trigger: message => (message.startsWith("!t") && !message.startsWith("!tell")),
    handler: handle_translate,
  },
  
];

client.addListener('message', function(from, to, message) {
  if(!process.env.QUIET){
    console.log(from + ' => ' + to + ': ' + message);
  }

  commands.forEach((c) => {
    if(c.trigger(message)){ 
      c.handler({from, to, message, db, client, lastmsg});
    }
  });

  lastmsg = message; 
}  );

client.addListener('join', function (channel, who){
  db.find({ to: who }, function (err, docs) {
    docs.forEach(d => {
      client.say(channel, d.to + ": " + d.from + " wanted you to know: " + d.content + " [ on " + d.time + " ]" );
      db.remove({ _id: d._id }, {}, function (err, numRemoved) {
        console.log(numRemoved);
      });
    }
    );

    });

    
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});
