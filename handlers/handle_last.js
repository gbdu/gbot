import { exec, spawn } from 'child_process';

export default function handle_translate({ message, client, to }) {
    const words = message.split(' ');

    try {
        let lang; let
            text;

        if (/^:[a-z]{2}$/.test(words[1])) {
            lang = words[1];
            text = words.slice(2);
        } else {
            lang = ':en';
            text = words.slice(1);
        }

        const child = spawn('trans', ['-brief', lang, '--', text.join(' ')]);

        child.on('error', (err) => {
            console.log(err);
            client.say(to, err);
        });

        child.stdout.on('data', (data) => {
            client.say(to, data.toString());
        });
    } catch (error) {
        console.log(error);
    }
}
