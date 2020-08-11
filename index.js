const irc = require('irc');
const { exec, spawn } = require('child_process');
const googleIt = require('google-it');
 
const CHANNEL = "#codelove"


require('dotenv').config();

var client = new irc.Client('irc.slashnet.org', 'gb3', {
   channels: [CHANNEL],
   nick: "gb3",
   userName: "gb3",
   password: process.env.PASSWORD,
   debug: true,
   showErrors: true, }
  );

var lastmsg = "";

client.addListener('registered', () => {client.say('tx', "I'm human... kinda");} )

client.addListener('message', function(from, to, message) {
  console.log(from + ' => ' + to + ': ' + message);

  if(message.startsWith("!g") || message.startsWith("gb3")){
    let s = message.split(' ').slice(1).join(' ');

        
    googleIt({ query: s })
    .then(results => {
      client.say(CHANNEL, results[0].title + " " + results[0].link)
    })
      .catch(e => {
        console.log("Error: " + e);
        client.say(CHANNEL, e);
      } );
  }

  if(message.startsWith("^infrench")){
    var child = spawn("trans", [":fr", "-brief", lastmsg]);
    child.stdout.on('data', data => {
      client.say(CHANNEL, data.toString());
    });
  }
  
  if(message.startsWith("!fortune")){
    let s = message.split(' ')[1]
    let lang = ""
    if(s == "fr" || s == "es" || s == "ru" || s == "de" || s == "cs"){
      lang = s ;
    }
    exec(`fortune -a ${lang}`, (err, stdout, stderr) => {
      if (err) {
        //some err occurred
        client.say(CHANNEL, err );
        console.error(err)
      } else {
       // the *entire* stdout and stderr (buffered)
       console.log(`stdout: ${stdout}`);
       console.log(`stderr: ${stderr}`);
       client.say(CHANNEL, stdout);

      }
    });
  }
  else if(message.startsWith("!FORTUNE")){
    let s = message.split(' ')[1]
    let lang = "fr"
    if(s == "fr" || s == "es" || s == "ru" || s == "de" || s == "cs"){
      lang = s ;
    }
    exec(`echo $(fortune ${lang} -s) | trans -brief`, (err, stdout, stderr) => {
      if (err) {
        //some err occurred
        client.say(CHANNEL, err );
        console.error(err)
      } else {
       // the *entire* stdout and stderr (buffered)
       console.log(`stdout: ${stdout}`);
       console.log(`stderr: ${stderr}`);
       client.say(CHANNEL, stdout);

      }
    });
  }
  else if(message.startsWith("!t")){
    message = message.replace(/-/g, '~');
    let s2 = message.split(' ');
    let s = message.split(' ').slice(1).join(' ');
    
    const patt = /^:[a-z]{2}$/
    if(patt.test(s2[1])){
      var child = spawn("trans", ["-brief", s2[1], s.slice(4)]);
    }
    else{
      var child = spawn("trans", ["-brief", s]);
    }

    child.stdout.on('data', data => {
      // console.log(data.toString());
      client.say(CHANNEL, data.toString());
    });
    
  }

  lastmsg = message; 
}  );


