const irc = require('irc');
const { exec, spawn } = require('child_process');
const googleIt = require('google-it');
const Datastore = require('nedb');

// load NICK, PASSWORD, CHANNEL from .env 
require('dotenv').config();

var db = new Datastore({ filename: 'gb3.db', autoload: true });

// Using a unique constraint with the index
db.ensureIndex({ fieldName: 'content', unique: true }, function (err) {
});

var client = new irc.Client(process.env.SERVER, process.env.NICK, {
  channels: [process.env.CHANNELS] || ["#codelove", "#test"],
  userName: process.env.NICK,
  password: process.env.PASSWORD,
  debug: true,
  showErrors: true, });

var lastmsg = "";

client.addListener('registered', () => {client.say('tx', "I'm human... kinda");} )

client.addListener('message', function(from, to, message) {
  console.log(from + ' => ' + to + ': ' + message);

  if(message.startsWith("!g") || message.startsWith("gb3")){
    let s = message.split(' ').slice(1).join(' ');

    googleIt({ query: s })
      .then(results => {
        client.say(to, results[0].title + " " + results[0].link)
        if(message.startsWith("!gg")){
          client.say(to, "Result 2: " + results[1].title + " " + results[1].link)
          client.say(to, "Result 3: " + results[2].title + " " + results[2].link)  
        }
      })
      .catch(e => {
        console.log("Error: " + e);
        client.say(to, e);
      } );
  }
  else if(message.startsWith("^infrench")){
    var child = spawn("trans", [":fr", "-brief", lastmsg]);
    child.stdout.on('data', data => {
      client.say(to, data.toString());
    });
  }
  else if(message.startsWith("!fortune")){
    let s = message.split(' ')[1]
    let lang = ""
    if(s == "fr" || s == "es" || s == "ru" || s == "de" || s == "cs"){
      lang = s ;
    }
    exec(`fortune -a ${lang}`, (err, stdout, stderr) => {
      if (err) {
        //some err occurred
        client.say(to, err );
        console.error(err)
      } else {
       // the *entire* stdout and stderr (buffered)
       console.log(`stdout: ${stdout}`);
       console.log(`stderr: ${stderr}`);
       client.say(to, stdout);

      }
    });
  }  
  else if(message.startsWith("!tell")){
    let words = message.split(' ');
    var datetime = new Date();
    
    db.count({}, function (err, count) {
      if(count > 10){
        client.say(to, "Message db full");
      }
      else if(words[1] && words[2]){
        console.log(words[1].length);

        var msg = {
          from: from,
          channel: to,
          to: words[1],
          content: words[2],
          time: datetime.toISOString().slice(0,10),
        };

        db.insert(msg, function (err){
          if(!err){
            client.say(to, "Ok, I'll let them know.");
          }
        });

      };
    
    });
  }
  else if(message.startsWith("!t")){
    message = message.replace(/-/g, '~');

    let words = message.split(' ');
    let s = words.slice(1).join(' ');
    
    if(/^:[a-z]{2}$/.test(words[1])){ 
      var child = spawn("trans", ["-brief", words[1], s.slice(4)]);
    }
    else{
      var child = spawn("trans", ["-brief", s]);
    }

    child.stdout.on('data', data => {
      // console.log(data.toString());
      client.say(to, data.toString());
    });
    
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
