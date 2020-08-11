const googleIt = require('google-it');
 
const { exec, spawn } = require('child_process');




async function translateText(text) {
  let command = "trans";
  let args = {text: text}
  var child = spawn(command, ["-brief", text]);
  
  child.stdout.on('data', data => {
    console.log(data.toString());
  });
                  
  
}

await  translateText("hola amigos");
