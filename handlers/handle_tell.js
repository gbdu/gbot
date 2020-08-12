export default function handle_tell(db, message, to, from, client) {
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
        content: words.slice(2).join(' '),
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
