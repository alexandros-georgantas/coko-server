const fs = require('fs')
const startServer = require('../src/startServer')

const init = async () => {
  const { server, createdWS } = await startServer()
  const heartbeat = ws => {
    console.log('pong', ws.isAlive)
    ws.isAlive = true
  }
  let clients = []

  createdWS.test1.on('connection', (ws, request, client) => {
    clients.push(client)
    ws.isAlive = true

    ws.on('pong', () => {
      heartbeat(ws)
    })
    // ws.on('ping', heartbeat)

    ws.on('message', function message(data) {
      const retrieved = JSON.parse(data)
      console.log(`Received message ${retrieved} from user ${client}`)
      ws.send(data)
    })

    ws.on('close', () => {
      console.log(`ws close ${client}`)
      clients = clients.filter(item => item !== client)
      console.log('clie', clients)
    })

    ws.on('error', function message(err) {
      console.log('error', err)
    })
  })

  const interval = setInterval(function ping() {
    createdWS.test1.clients.forEach(ws => {
      console.log('waa1', ws.isAlive)
      if (ws.isAlive === false) {
        console.log('waa2')
        console.log('broken connection')
        return ws.terminate()
      }
      console.log('waa3')
      ws.isAlive = false
      ws.ping()
    })
  }, 10000)

  createdWS.test1.on('close', () => {
    console.log('server died')
    fs.writeFileSync('./test.txt', 'closed', 'utf-8')
    clearInterval(interval)
  })
}

init()
