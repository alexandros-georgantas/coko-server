const config = require('config')
const isEmpty = require('lodash/isEmpty')
const { applyMiddleware } = require('graphql-middleware')
const { shield } = require('graphql-shield')

const logger = require('@pubsweet/logger')
const schema = require('pubsweet-server/src/graphql/schema')

const emailMiddleware = require('./middleware/email')

const baseMessage = 'Coko server =>'

const logRegistration = name =>
  logger.info(`${baseMessage} Middleware: Registered ${name} middleware`)

const middleware = []
console.log('') // eslint-disable-line no-console
logger.info(`${baseMessage} Registering graphql middleware...`)

/**
 * Authorization middleware
 */

const permissions = config.has('permissions') && config.get('permissions')
const isProduction = process.env.NODE_ENV === 'production'

if (!isEmpty(permissions)) {
  const authorizationMiddleware = shield(permissions, {
    allowExternalErrors: true,
    debug: !isProduction,
  })

  middleware.push(authorizationMiddleware)
  logRegistration('authorization')
}

/**
 * Email middleware
 */

const emailConfig =
  config.has('emailMiddleware') && config.get('emailMiddleware')

if (!isEmpty(emailConfig)) {
  middleware.push(emailMiddleware)
  logRegistration('email')
}

console.log('') // eslint-disable-line no-console

const schemaWithMiddleWare = applyMiddleware(schema, ...middleware)

module.exports = schemaWithMiddleWare
