const { ApolloServer } = require('apollo-server-express')
const isEmpty = require('lodash/isEmpty')
const config = require('config')

const logger = require('@pubsweet/logger')
const errors = require('@pubsweet/errors')

const connectors = require('pubsweet-server/src/connectors')
const loaders = require('pubsweet-server/src/graphql/loaders')
const helpers = require('pubsweet-server/src/helpers/authorization')

const schema = require('./graphqlSchema')

const hostname = config.has('pubsweet-server.hostname')
  ? config.get('pubsweet-server.hostname')
  : 'localhost'

const extraApolloConfig = config.has('pubsweet-server.apollo')
  ? config.get('pubsweet-server.apollo')
  : {}

const api = app => {
  app.use(
    '/graphql',
    app.locals.passport.authenticate(['bearer', 'anonymous'], {
      session: false,
    }),
  )

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      helpers,
      connectors,
      user: req.user,
      loaders: loaders(),
    }),
    formatError: err => {
      const error = isEmpty(err.originalError) ? err : err.originalError

      logger.error(error.message, { error })

      const isPubsweetDefinedError = Object.values(errors).some(
        pubsweetError => error instanceof pubsweetError,
      )

      // err is always a GraphQLError which should be passed to the client
      if (!isEmpty(err.originalError) && !isPubsweetDefinedError)
        return {
          name: 'Server Error',
          message: 'Something went wrong! Please contact your administrator',
        }

      return {
        name: error.name || 'GraphQLError',
        message: error.message,
        extensions: {
          code: err.extensions.code,
        },
      }
    },
    playground: {
      subscriptionEndpoint: `ws://${hostname}:3000/subscriptions`,
    },
    ...extraApolloConfig,
  })
  server.applyMiddleware({ app })
}

module.exports = api
