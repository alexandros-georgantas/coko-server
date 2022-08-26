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

const hostname = config.has('pubsweet-server.hostname')
  ? config.get('pubsweet-server.hostname')
  : 'localhost'

const extraApolloConfig = config.has('pubsweet-server.apollo')
  ? config.get('pubsweet-server.apollo')
  : {}

let origin = '*'
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

  origin = `${clientProtocol}://${clientHost}${
    clientPort ? `:${clientPort}` : ''
  }`
}

const createGraphQLServer = testUserContext => {
  if (process.env.NODE_ENV !== 'test' && testUserContext) {
    throw new Error(
      'Do not pass a test user context unless you are running a test suite',
    )
  }

  const createdLoaders = loaders()

  return new ApolloServer({
    schema,
    cors: {
      origin,
      credentials: true,
    },
    csrfPrevention: true,
    context: ({ req, res }) => ({
      helpers,
      connectors,
      user: testUserContext || req.user,
      loaders: createdLoaders,
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
    playground: {
      subscriptionEndpoint: `ws://${hostname}:3000/subscriptions`,
    },
    ...extraApolloConfig,
  })
}

module.exports = createGraphQLServer
