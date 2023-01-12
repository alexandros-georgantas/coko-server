const express = require('express')
const { promisify } = require('util')
const http = require('http')
const config = require('config')
const fs = require('fs')
const path = require('path')
const { WebSocketServer } = require('ws')
const logger = require('@pubsweet/logger')
// const { initializeWS } = require('./initializeWS')

let server

const startServer = async (app = express()) => {
  if (server) return server

  let configureApp
  const createdWS = {}
  // ./server/app.js in your app is used if it exist,
  // and no different entrypoint is configured in the
  // config at `pubsweet-server.app`
  const appPath = path.resolve('.', 'server', 'app.js')

  if (config.has('pubsweet-server.app')) {
    // See if a custom app entrypoint is configured
    configureApp = config.get('pubsweet-server.app')
  } else if (fs.existsSync(appPath)) {
    // See if a custom app entrypoint exists at ./server/app.js
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    configureApp = require(appPath)
  } else {
    // If no custom entrypoints exist, use the default
    /* eslint-disable-next-line global-require */
    configureApp = require('./app')
  }

  const configuredApp = configureApp(app)
  const port = config['pubsweet-server'].port || 3000
  configuredApp.set('port', port)
  const httpServer = http.createServer(configuredApp)
  httpServer.app = configuredApp

  logger.info(`Starting HTTP server`)
  const startListening = promisify(httpServer.listen).bind(httpServer)
  await startListening(port)

  const wss = new WebSocketServer({ port: 5555 })

  wss.on('connection', ws => {
    console.log('eee', ws)
    // clients.push(client)
    ws.on('open', function open() {
      ws.send('hello')
    })
    ws.on('message', data => {
      console.log('received: %s', data)
    })

    ws.on('close', function close() {
      console.log('disconnected')
    })

    // ws.send('something')
  })

  logger.info(`App is listening on port ${port}`)
  await configuredApp.onListen(httpServer)

  // if (config.has('pubsweet-server.useWebSockets')) {
  //   createdWS = await initializeWS(httpServer)
  // }

  httpServer.originalClose = httpServer.close

  httpServer.close = async cb => {
    server = undefined
    await configuredApp.onClose()
    return httpServer.originalClose(cb)
  }

  server = httpServer

  return { server, createdWS }
}

module.exports = startServer
