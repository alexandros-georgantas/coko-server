const { createServer } = require('http')
const { WebSocketServer } = require('ws')
const webSocket = require('ws')

const server = createServer()
const wss = new WebSocketServer({ server })

wss.on('connection', function connection(ws) {
  console.log('new client connected')
  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      console.log(`Client has sent us: ${data}`)
      console.log(client.readyState)
      console.log(webSocket.OPEN)
      if (client.readyState === webSocket.OPEN) {
        client.send(data, { binary: isBinary })
      }
    })
  })
})
console.log('The WebSocket server is running on port 8080')
server.listen(8080)
