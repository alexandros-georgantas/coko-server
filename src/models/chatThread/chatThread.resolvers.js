const logger = require('../../logger')

const {
  labels: { CHAT_THREAD_RESOLVER },
} = require('./constants')

const { getChatThread, getChatThreads } = require('./chatThread.controller')

const chatThreadResolver = async (_, { id }, ctx) => {
  try {
    logger.info(`${CHAT_THREAD_RESOLVER} getChatThread`)
    return getChatThread(id)
  } catch (e) {
    logger.error(`${CHAT_THREAD_RESOLVER} getChatThread: ${e.message}`)
    throw new Error(e)
  }
}

const chatThreadsResolver = async (_, { where }, ctx) => {
  try {
    logger.info(`${CHAT_THREAD_RESOLVER} getChatThreads`)
    return getChatThreads(where)
  } catch (e) {
    logger.error(`${CHAT_THREAD_RESOLVER} getChatThreads: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    chatThread: chatThreadResolver,
    chatThreads: chatThreadsResolver,
  },
  ChatThread: {
    async messages(chatThread, _, ctx) {
      const { id } = chatThread
      return ctx.loaders.ChatMessage.messagesBasedOnChatThreadIdsLoader.load(id)
    },
  },
}
