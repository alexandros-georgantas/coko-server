const model = require('./chatMessage.model')
const { messagesBasedOnChatThreadIdsLoader } = require('./chatMessage.loaders')

module.exports = {
  model,
  modelName: 'ChatMessage',
  modelLoaders: {
    messagesBasedOnChatThreadIdsLoader,
  },
}
