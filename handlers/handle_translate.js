import { exec, spawn } from 'child_process';

export default function handle_translate({message, client, to}){
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
