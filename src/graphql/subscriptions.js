/**
 * subscription (websocket) server for GraphQL
 */
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const logger = require('../logger')

const graphqlSchema = require('../graphqlSchema')
const { token } = require('../authentication')

module.exports = {
  addSubscriptions: server => {
    /* eslint-disable-next-line global-require */
    const connectors = require('../connectors')
    /* eslint-disable-next-line global-require */
    const helpers = require('../authorization')

    SubscriptionServer.create(
      {
        schema: graphqlSchema,
        execute,
        subscribe,
        onConnect: (connectionParams, webSocket, context) => {
          if (!connectionParams.authToken) {
            throw new Error('Missing auth token')
          }

          return new Promise((resolve, reject) => {
            token.verify(connectionParams.authToken, (_, id) => {
              if (!id) {
                logger.info('Bad auth token')
                reject(new Error('Bad auth token'))
              }

              resolve({ user: id, connectors, helpers })
            })
          })
        },
      },
      {
        server,
        path: '/subscriptions',
      },
    )
  },
}
