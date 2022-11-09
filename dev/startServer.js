const startServer = require('../src/startServer')

const init = async () => {
  const { server, createdWS } = await startServer()
  const heartbeat = ws => {
    console.log('pong')
    ws.isAlive = true
  }
  let clients = []

  createdWS.test1.on('connection', (ws, request, client) => {
    clients.push(client)
    ws.isAlive = true

    ws.on('pong', () => {
      heartbeat(ws)
    })

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
      if (ws.isAlive === false) {
        console.log('broken connection')
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping()
    })
  }, 5000)

  createdWS.test1.on('close', () => {
    console.log('server died')
    clearInterval(interval)
  })
}

init()
