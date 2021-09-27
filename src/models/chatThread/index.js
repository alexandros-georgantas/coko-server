const model = require('./chatThread.model')
const gqlLoader = require('../graphqlLoaderUtil')
const chatThreadResolvers = require('./chatThread.resolvers')

module.exports = {
  model,
  modelName: 'ChatThread',
  typeDefs: gqlLoader('chatThread/chatThread.graphql'),
  resolvers: chatThreadResolvers,
}
