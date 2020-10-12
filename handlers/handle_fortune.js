const ps = require('child_process');

function handle_fortune({client, to, message}) {
    let s = message.split(' ')[1];
    let lang = ""
    if(s == "fr" || s == "es" || s == "ru" || s == "de" || s == "cs"){
        lang = s ;
    }
    ps.exec(`fortune ${lang}`, (err, stdout, stderr) => {
        if (err) {
        //some err occurred
            client.say(to, err );
            console.error(err);
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);

            message = stdout.replace(/\n/g, ' ');
            client.say(to, message);

        }
    });  
}

exports.handle_fortune = handle_fortune
