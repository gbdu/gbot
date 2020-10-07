const zmq = require("zeromq")

async function run() {
  const sock = new zmq.Subscriber
  
  sock.connect("tcp://127.0.0.1:33300")
  sock.subscribe("!")
  console.log("Subscriber connected to port 33300")
  
  for await (const [topic, msg] of sock) {
    //console.log("received a message related to:", topic, "containing message:", msg)
    console.log(topic.toString());
    
  }
}

run()
