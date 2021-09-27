const model = require('./chatMessage.model')
const gqlLoader = require('../graphqlLoaderUtil')
const { messagesBasedOnChatThreadIdsLoader } = require('./chatMessage.loaders')
const chatMessageResolvers = require('./chatMessage.resolvers')

module.exports = {
  model,
  modelName: 'ChatMessage',
  modelLoaders: {
    messagesBasedOnChatThreadIdsLoader,
  },
  typeDefs: gqlLoader('chatMessage/chatMessage.graphql'),
  resolvers: chatMessageResolvers,
}
