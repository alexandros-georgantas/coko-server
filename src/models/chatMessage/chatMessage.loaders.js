const { logger } = require('@pubsweet/logger')

const ChatMessage = require('./chatMessage.model')

const {
  labels: { CHAT_MESSAGE_LOADER },
} = require('./constants')

const messagesBasedOnChatThreadIdsLoader = async chatThreadIds => {
  try {
    const chatThreadMessages = await ChatMessage.query().whereIn(
      'chatThreadId',
      chatThreadIds,
    )

    return chatThreadIds.map(chatThreadId =>
      chatThreadMessages.filter(
        chatMessage => chatMessage.chatThreadId === chatThreadId,
      ),
    )
  } catch (e) {
    logger.error(
      `${CHAT_MESSAGE_LOADER} messagesBasedOnChatThreadIdsLoader: ${e.message}`,
    )
    throw new Error(e)
  }
}

module.exports = {
  messagesBasedOnChatThreadIdsLoader,
}
