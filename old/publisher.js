const zmq = require("zeromq")

async function run() {
  const sock = new zmq.Publisher
  
  await sock.bind("tcp://127.0.0.1:33300")
  console.log("Publisher bound to port 33300")
 
  while (true) {
    console.log("sending a multipart message envelope")
    await sock.send(["!", "meow!"])
    await new Promise(resolve => setTimeout(resolve, 3500))
  }
}
 
run()
