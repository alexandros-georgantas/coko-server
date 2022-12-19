const {
  ApolloServer,
  ForbiddenError,
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require('apollo-server-express')

const isEmpty = require('lodash/isEmpty')
const config = require('config')
const { graphqlUploadExpress } = require('graphql-upload')

const logger = require('@pubsweet/logger')
const errors = require('@pubsweet/errors')

const connectors = require('pubsweet-server/src/connectors')
const loaders = require('pubsweet-server/src/graphql/loaders')
const helpers = require('pubsweet-server/src/helpers/authorization')

const schema = require('./graphqlSchema')
const createCORSConfig = require('./corsConfig')

const isDevelopment = process.env.NODE_ENV === 'development'

const extraApolloConfig = config.has('pubsweet-server.apollo')
  ? config.get('pubsweet-server.apollo')
  : {}

const apolloServerConfig = {
  uploads: false,
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
  introspection: process.env.NODE_ENV === 'development',
  ...extraApolloConfig,
}

if (isDevelopment) {
  const host = `${config.get('pubsweet-server.host')}${
    config.get('pubsweet-server.port')
      ? `:${config.get('pubsweet-server.port')}`
      : ''
  }`

  apolloServerConfig.playground = {
    subscriptionEndpoint: `ws://${host}/subscriptions`,
  }
}

const api = app => {
  app.use(
    '/graphql',
    app.locals.passport.authenticate(['bearer', 'anonymous'], {
      session: false,
    }),
  )

  app.use(graphqlUploadExpress())

  const server = new ApolloServer(apolloServerConfig)

  const CORSConfig = createCORSConfig()
  server.applyMiddleware({ app, cors: CORSConfig })
}

module.exports = api
