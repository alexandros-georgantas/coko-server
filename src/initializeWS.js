const config = require('config')

const { URL } = require('url')

const { WebSocketServer } = require('ws')

const initializeWS = async httpServer => {
  const createdWS = {}
  const specificPurposeWebSockets = []

  if (config.has('pubsweet-server.websocketPaths')) {
    const deconstructedPaths = config
      .get('pubsweet-server.websocketPaths')
      .split(',')

    deconstructedPaths.forEach(wsPathname => {
      specificPurposeWebSockets.push(wsPathname.trim())
    })
  }

  specificPurposeWebSockets.forEach(path => {
    createdWS[path] = new WebSocketServer({
      noServer: true,
      ClientTracking: true,
    })
  })

  httpServer.on('upgrade', async (req, socket, head) => {
    const serverURL = config.has('pubsweet-server.publicURL')
      ? config.get('pubsweet-server.publicURL')
      : config.get('pubsweet-server.baseUrl')

    const { pathname } = new URL(req.url, serverURL)

    specificPurposeWebSockets.forEach(path => {
      if (pathname === `/${path}`) {
        return createdWS[path].handleUpgrade(req, socket, head, ws => {
          createdWS[path].emit('connection', ws, req, req.client)
        })
      }

      return null
    })
  })

  return createdWS
}

module.exports = { initializeWS }
