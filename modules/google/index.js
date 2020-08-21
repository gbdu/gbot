import googleIt from 'google-it';

// * Handles the action
function handler({message , to, client}) {
  let s = message.split(' ').slice(1).join(' ');

  googleIt({ query: s })
    .then(results => {
      client.say(to, results[0].title + " " + results[0].link) ;
      
      if(message.startsWith("!gg")){
        client.say(to, "Result 2: " + results[1].title + " " + results[1].link) ;
        client.say(to, "Result 3: " + results[2].title + " " + results[2].link) ;
      }
    })
    .catch(e => {
      console.log("Error: " + e);
      client.say(to, e);
    } );
  
}

// * Returns a lambda that decides when the handler should be fired
function trigger(){
  return (m) => (m.message.startsWith("!g") ||
                 m.message.startsWith(m.client.nick)) ;
  
}

// * Export
export {
  handler,
  trigger,
} ;
