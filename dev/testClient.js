const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:3000/test1?token=123')
function heartbeat() {
  clearTimeout(this.pingTimeout)
  console.log('ping')
  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  this.pingTimeout = setTimeout(() => {
    console.log('run')
    this.terminate()
  }, 5000 + 1000)
}
// ws.on('open', function open() {
//   ws.send(JSON.stringify({ hello: 'test' }))
//   heartbeat()
// })
ws.on('open', heartbeat)
ws.on('ping', heartbeat)
// ws.on('pong', heartbeat)
ws.on('message', function message(data) {
  const retrieved = JSON.parse(data)
  console.log('received: %s', retrieved)
})

ws.on('close', function message() {
  console.log('client on close')
  clearTimeout(this.pingTimeout)
})
