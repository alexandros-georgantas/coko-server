// const { createServer } = require('http')
const { WebSocketServer } = require('ws')
const webSocket = require('ws')
const startServer = require('../startServer')

const init = async () => {
  const server = await startServer()
  // console.log('eaaa', server)
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
}

init()
