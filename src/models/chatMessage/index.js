const fs = require('fs')
const path = require('path')
const model = require('./chatMessage.model')
const { messagesBasedOnChatThreadIdsLoader } = require('./chatMessage.loaders')
const chatMessageResolvers = require('./chatMessage.resolvers')

module.exports = {
  model,
  modelName: 'ChatMessage',
  modelLoaders: {
    messagesBasedOnChatThreadIdsLoader,
  },
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'chatMessage.graphql'),
    'utf-8',
  ),
  resolvers: chatMessageResolvers,
}
