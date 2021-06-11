const {
  ApolloServer,
  ForbiddenError,
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require('apollo-server-express')

const isEmpty = require('lodash/isEmpty')
const config = require('config')

const logger = require('@pubsweet/logger')
const errors = require('@pubsweet/errors')

const connectors = require('pubsweet-server/src/connectors')
const loaders = require('pubsweet-server/src/graphql/loaders')
const helpers = require('pubsweet-server/src/helpers/authorization')

const schema = require('./graphqlSchema')

const host = `${config.get('pubsweet-server.host')}${
  config.get('pubsweet-server.port')
    ? `:${config.get('pubsweet-server.port')}`
    : ''
}`

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

      req,
      res,
    }),
    formatError: err => {
      const error = isEmpty(err.originalError) ? err : err.originalError

      logger.error(error.message, { error })

      const isPubsweetDefinedError = Object.values(errors).some(
        pubsweetError => error instanceof pubsweetError,
      )

      const isGraphqlDefinedError = [
        ForbiddenError,
        UserInputError,
        AuthenticationError,
        ApolloError,
      ].some(graphqlError => error instanceof graphqlError)

      // err is always a GraphQLError which should be passed to the client
      if (
        !isEmpty(err.originalError) &&
        !isPubsweetDefinedError &&
        !isGraphqlDefinedError
      )
        return {
          name: 'Server Error',
          message: 'Something went wrong! Please contact your administrator',
        }

      if (isGraphqlDefinedError) return error

      return {
        name: error.name || 'GraphQLError',
        message: error.message,
        extensions: {
          code: err.extensions.code,
        },
      }
    },
    playground:
      process.env.NODE_ENV === 'production'
        ? false
        : {
            subscriptionEndpoint: `ws://${host}/subscriptions`,
          },
    introspection: process.env.NODE_ENV === 'development',
    ...extraApolloConfig,
  })

  server.applyMiddleware({ app })
}

module.exports = api
