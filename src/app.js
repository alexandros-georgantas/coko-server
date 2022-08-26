/* eslint-disable global-require, no-param-reassign */

const path = require('path')

const bodyParser = require('body-parser')
const config = require('config')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const express = require('express')
const helmet = require('helmet')
const STATUS = require('http-status-codes')
const morgan = require('morgan')
const passport = require('passport')
const wait = require('waait')

const logger = require('@pubsweet/logger')

const registerComponents = require('pubsweet-server/src/register-components')
const api = require('pubsweet-server/src/routes/api')
const index = require('pubsweet-server/src/routes/index')

const healthcheck = require('./healthcheck')

const configureApp = app => {
  const models = require('@pubsweet/models')
  const authsome = require('pubsweet-server/src/helpers/authsome')

  app.locals.models = models

  app.use(bodyParser.json({ limit: '50mb' }))
  morgan.token('graphql', ({ body }, res, type) => {
    if (!body.operationName) return ''
    switch (type) {
      case 'query':
        return body.query.replace(/\s+/g, ' ')
      case 'variables':
        return JSON.stringify(body.variables)
      case 'operation':
      default:
        return body.operationName
    }
  })
  app.use(
    morgan(config.get('pubsweet-server').morganLogFormat || 'combined', {
      stream: logger.stream,
    }),
  )

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(helmet())
  app.use(express.static(path.resolve('.', '_build')))
  app.use(express.static(path.resolve('.', 'static')))

  if (config.has('pubsweet-server.uploads')) {
    app.use(
      cors({
        origin: '*',
      }),
      '/uploads',
      express.static(path.resolve(config.get('pubsweet-server.uploads'))),
    )
  }

  // Allow CORS from client if host / port is different
  if (config.has('pubsweet-client.host')) {
    const clientProtocol =
      (config.has('pubsweet-client.protocol') &&
        config.get('pubsweet-client.protocol')) ||
      'http'

    let clientHost = config.get('pubsweet-client.host')

    const clientPort =
      config.has('pubsweet-client.port') && config.get('pubsweet-client.port')

    // This is here because webpack dev server might need to be started with
    // 0.0.0.0 instead of localhost, but the incoming request will still be
    // eg. http://localhost:4000, not http://0.0.0.0:4000, which will make
    // the CORS check fail
    if (clientHost === '0.0.0.0' || clientHost === '127.0.0.1') {
      clientHost = 'localhost'
    }

    const clientUrl = `${clientProtocol}://${clientHost}${
      clientPort ? `:${clientPort}` : ''
    }`

    app.use(
      cors({
        origin: clientUrl,
        credentials: true,
      }),
    )
  }

  // Register passport authentication strategies
  app.use(passport.initialize())
  const authentication = require('pubsweet-server/src/authentication')

  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.locals.passport = passport
  app.locals.authsome = authsome

  registerComponents(app)

  app.use('/api', api) // REST API

  app.get('/healthcheck', healthcheck) // Server health endpoint

  let useGraphQLServer = true
  if (
    config.has('pubsweet-server.useGraphQLServer') &&
    config.get('pubsweet-server.useGraphQLServer') === false
  ) {
    useGraphQLServer = false
  }

  if (useGraphQLServer) {
    const gqlApi = require('./graphqlApi')
    gqlApi(app) // GraphQL API
  }

  if (
    config.has('pubsweet-server.serveClient') &&
    config.get('pubsweet-server.serveClient')
  ) {
    app.use('/', index)
  }

  app.use((err, req, res, next) => {
    // Development error handler, will print stacktrace
    if (app.get('env') === 'development' || app.get('env') === 'test') {
      logger.error(err)
      logger.error(err.stack)
    }

    if (err.name === 'ValidationError') {
      return res.status(STATUS.BAD_REQUEST).json({ message: err.message })
    }

    if (err.name === 'ConflictError') {
      return res.status(STATUS.CONFLICT).json({ message: err.message })
    }

    if (err.name === 'AuthorizationError') {
      return res.status(err.status).json({ message: err.message })
    }

    if (err.name === 'AuthenticationError') {
      return res.status(STATUS.UNAUTHORIZED).json({ message: err.message })
    }

    return res
      .status(err.status || STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message })
  })

  let useJobQueue = true
  if (
    config.has('pubsweet-server.useJobQueue') &&
    config.get('pubsweet-server.useJobQueue') === false
  ) {
    useJobQueue = false
  }

  // Actions to perform when the HTTP server starts listening
  app.onListen = async server => {
    if (useGraphQLServer) {
      const {
        addSubscriptions,
      } = require('pubsweet-server/src/graphql/subscriptions')
      addSubscriptions(server) // Add GraphQL subscriptions
    }

    if (useJobQueue) {
      const { startJobQueue } = require('pubsweet-server/src/jobs')
      await startJobQueue() // Manage job queue
    }

    if (config.has('pubsweet-server.cron.path')) {
      /* eslint-disable-next-line import/no-dynamic-require */
      require(config.get('pubsweet-server.cron.path'))
    }
  }

  // Actions to perform when the server closes
  app.onClose = async () => {
    if (useJobQueue) {
      const { stopJobQueue } = require('pubsweet-server/src/jobs')
      await stopJobQueue()
    }
    return wait(500)
  }

  return app
}

module.exports = configureApp
