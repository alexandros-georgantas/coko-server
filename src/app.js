/* eslint-disable no-param-reassign */

const path = require('path')

const bodyParser = require('body-parser')
const config = require('config')
const cookieParser = require('cookie-parser')
const express = require('express')
const helmet = require('helmet')
const STATUS = require('http-status-codes')
const morgan = require('morgan')
const passport = require('passport')
const wait = require('waait')

const logger = require('@pubsweet/logger')
const models = require('@pubsweet/models')

const gqlApi = require('pubsweet-server/src/graphql/api')
const index = require('pubsweet-server/src/routes/index')
const api = require('pubsweet-server/src/routes/api')
const registerComponents = require('pubsweet-server/src/register-components')
const authsome = require('pubsweet-server/src/helpers/authsome')
const authentication = require('pubsweet-server/src/authentication')
const { startJobQueue, stopJobQueue } = require('pubsweet-server/src/jobs')
const {
  addSubscriptions,
} = require('pubsweet-server/src/graphql/subscriptions')

const configureApp = app => {
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

  if (config.has('pubsweet-server.uploads')) {
    app.use(
      '/uploads',
      express.static(path.resolve(config.get('pubsweet-server.uploads'))),
    )
  }

  // Register passport authentication strategies
  app.use(passport.initialize())
  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.locals.passport = passport
  app.locals.authsome = authsome

  registerComponents(app)

  app.use('/api', api) // REST API
  gqlApi(app) // GraphQL API

  app.use('/', index) // Serve the index page for front end

  app.use((err, req, res, next) => {
    // development error handler, will print stacktrace
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

  // Actions to perform when the HTTP server starts listening
  app.onListen = async server => {
    // Add GraphQL subscriptions
    addSubscriptions(server)

    // Manage job queue
    await startJobQueue()
  }

  // Actions to perform when the server closes
  app.onClose = async () => {
    await stopJobQueue()
    return wait(500)
  }

  return app
}

module.exports = configureApp
