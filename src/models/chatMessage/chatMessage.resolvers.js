const { logger } = require('../../index')

const {
  labels: { CHAT_MESSAGE_RESOLVER },
} = require('./constants')
const {
  sendMessage,
  deleteMessage,
  editMessage,
} = require('./chatMessage.controller')

const sendMessageResolver = async (_, { input }, ctx) => {
  try {
    const { chatThreadId, content, userId, mentions } = input
    logger.error(`${CHAT_MESSAGE_RESOLVER} sendMessage`)
    return sendMessage(chatThreadId, content, userId, mentions)
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_RESOLVER} sendMessage: ${e.message}`)
    throw new Error(e)
  }
}

const editMessageResolver = async (_, { input }, ctx) => {
  try {
    const { id, content, mentions } = input
    logger.error(`${CHAT_MESSAGE_RESOLVER} editMessage`)
    return editMessage(id, content, mentions)
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_RESOLVER} editMessage: ${e.message}`)
    throw new Error(e)
  }
}

const deleteMessageResolver = async (_, { id }, ctx) => {
  try {
    logger.error(`${CHAT_MESSAGE_RESOLVER} deleteMessage`)
    return deleteMessage(id)
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_RESOLVER} deleteMessage: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  Mutation: {
    sendMessage: sendMessageResolver,
    editMessage: editMessageResolver,
    deleteMessage: deleteMessageResolver,
  },
}
