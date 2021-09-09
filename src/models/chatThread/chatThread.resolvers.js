const { getChatThread, getChatThreads } = require('./chatThread.controller')

module.exports = {
  Query: {
    chatThread: getChatThread,
    chatThreads: getChatThreads,
  },

  ChatThread: {
    async messages(chatThread, _, ctx) {
      const { id } = chatThread
      return ctx.loaders.ChatMessage.messagesBasedOnChatThreadIdsLoader.load(id)
    },
  },
}
