const startServer = require('../src/startServer')

const init = async () => {
  const { createdWS } = await startServer()
  const heartbeat = ws => {
    const argumentWS = ws
    console.log('pong')
    argumentWS.isAlive = true
  }
  let clients = []

  createdWS.test1.on('connection', (ws, request, client) => {
    const injectedWS = ws
    clients.push(client)
    injectedWS.isAlive = true

    injectedWS.on('pong', () => {
      heartbeat(injectedWS)
    })

    injectedWS.on('message', function message(data) {
      const retrieved = JSON.parse(data)
      console.log(`Received message ${retrieved} from user ${client}`)
      injectedWS.send(data)
    })

    injectedWS.on('close', () => {
      console.log(`ws close ${client}`)
      clients = clients.filter(item => item !== client)
      console.log('clie', clients)
    })

    injectedWS.on('error', function message(err) {
      console.log('error', err)
    })
  })

  const interval = setInterval(function ping() {
    createdWS.test1.clients.forEach(client => {
      const clientArgument = client
      if (clientArgument.isAlive === false) {
        console.log('broken connection')
        return clientArgument.terminate()
      }
      clientArgument.isAlive = false
      return clientArgument.ping()
    })
  }, 5000)

  createdWS.test1.on('close', () => {
    console.log('server died')
    clearInterval(interval)
  })
}

init()
