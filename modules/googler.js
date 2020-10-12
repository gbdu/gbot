const init = require("../init.js");
const request = require("request");

init.init_config();
db = init.init_db();
db_publisher = db.duplicate();


db.on("message", function(channel, msg){
    msg = JSON.parse(msg);
    if(msg.message.startsWith("!g")){
        let cmd = msg.message.split(" ")
        let query = cmd.slice(1).join(" ");

        let max_results = msg.message.startsWith("!gg") ? 3 : 1;

        console.log(process.env.SCRAPER_URL);
        let form = {
            "browser_config": { random_user_agent: false, clean_html_output: true, html_output: false },
            "scrape_config": { search_engine: "bing", keywords: [query], num_pages: 1}
        };

        console.log(JSON.stringify(form));
        request.post({ url: process.env.SCRAPER_URL, json: true, body: form }, (err, res, body) => {
            if(body.results){
                try {
                    let results = body.results[query][1].results;
                    
                    
                    for (let i = 0; i < results.length && i < max_results; i++) {
                        let reply_msg = {
                            from: process.env.NICK,
                            to: msg.to,
                            message: results[i].title + " " + results[i].link,
                            type: "reply",
                        };

                        db_publisher.publish('msg', JSON.stringify(reply_msg));
                    }
                    
                }
                catch (err) {
                    console.log(err);
                }
            }
        });
        
        

    }
});

db.subscribe("msg");
