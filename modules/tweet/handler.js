export default function handle_tweet({message, to, client, twitter}){
  twitter.get('statuses/user_timeline', {count: 1}, function(error, tweets, response) {
    // if(error) throw error;
    console.log(tweets[0].created_at);  // The favorites.
//    console.log(response);  // Raw response object.
  });

  // twitter.post('statuses/update', {status: '#gb3 is awesome'})
  // .then(function (tweet) {
  //   console.log(tweet);
  // })
  // .catch(function (error) {
  //   throw error;
  // });

}
