import irc from 'irc';

import DataStore from 'nedb';
import dotenv from 'dotenv';

import handle_google from './handlers/handle_google';
import handle_fortune from './handlers/handle_fortune';
import handle_tell from './handlers/handle_tell';
import handle_translate from './handlers/handle_translate';

function init_config(){
  return dotenv.config(); 
}

function init_db(){
  // TODO error handling for db loading
  var db = new DataStore({ filename: 'gb3.db', autoload: true });

  // Use a unique constraint for the message to avoid duplicates
  db.ensureIndex({ fieldName: 'content', unique: true });
  return db;
}

function init_irc(){
  // Setup irc client with info from .env
  var client = new irc.Client(
    process.env.SERVER || "irc.slashnet.org",
    process.env.NICK || "gb3", {
      channels: [process.env.CHANNELS] || ["#test"],
      userName: process.env.NICK || "gb3",
      password: process.env.PASSWORD,
      debug: process.env.QUIET ? false : true,
      showErrors: process.env.QUIET ? false : true, });

  return client;
}

var result = init_config();
var db = init_db();
var client = init_irc();

var lastmsg = "";

client.addListener('registered',
                   () => {
                     client.say('tx', "I'm human... kinda");
                   } );

client.addListener('message', function(from, to, message) {
  console.log(from + ' => ' + to + ': ' + message);

  if(message.startsWith("!g") || message.startsWith(client.nick)){
    handle_google(message, to, client);
  }
  else if(message.startsWith("^infrench")){
    var child = spawn("trans", [":fr", "-brief", lastmsg]);
    child.stdout.on('data', data => {
      client.say(to, data.toString());
    });
  }
  else if(message.startsWith("!fortune")){
    handle_fortune(client, to, message);
  }  
  else if(message.startsWith("!tell")){
    handle_tell(db, message, to, from, client);
  }
  else if(message.startsWith("!t")){
    handle_translate(message);
  }

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
