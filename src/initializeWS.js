const config = require('config')

// const { URL } = require('url')

const { WebSocketServer } = require('ws')

// const { authenticateWS } = require('./helpers')

const initializeWS = async httpServer => {
  const createdWS = {}
  // const specificPurposeWebSockets = []

  // if (config.has('pubsweet-server.websocketPaths')) {
  //   const deconstructedPaths = config
  //     .get('pubsweet-server.websocketPaths')
  //     .split(',')

  //   deconstructedPaths.forEach(wsPathname => {
  //     specificPurposeWebSockets.push(wsPathname.trim())
  //   })
  // }

  // specificPurposeWebSockets.forEach(path => {
  //   createdWS[path] = new WebSocketServer({ noServer: true })
  // })

  if (config.has('pubsweet-server.websockets')) {
    config.get('pubsweet-server.websockets').forEach(websocket => {
      const { path, port } = websocket
      createdWS[path] = new WebSocketServer({ port, path })
    })
  }

  httpServer.on('upgrade', async (req, socket, head) => {
    // console.log(`http://${req.headers.host}/`)

    // const serverURL = config.has('pubsweet-server.publicURL')
    //   ? config.get('pubsweet-server.publicURL')
    //   : config.get('pubsweet-server.baseUrl')

    // const { pathname } = new URL(req.url, serverURL)

    // if (!authenticateWS(req)) {
    //   socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    //   socket.destroy()
    //   return
    // }
    config.get('pubsweet-server.websockets').forEach(websocket => {
      const { path } = websocket
      return createdWS[path].handleUpgrade(req, socket, head, ws => {
        createdWS[path].emit('connection', ws, req, req.client)
      })
    })
    // specificPurposeWebSockets.forEach(path => {
    //   if (pathname === `/${path}`) {
    //     return createdWS[path].handleUpgrade(req, socket, head, ws => {
    //       createdWS[path].emit('connection', ws, req, req.client)
    //     })
    //   }

    //   return null
    // })
  })

  return createdWS
}

module.exports = { initializeWS }
