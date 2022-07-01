const logger = require('@pubsweet/logger')

const ChatThread = require('./chatThread.model')
const useTransaction = require('../useTransaction')

const {
  labels: { CHAT_THREAD_CONTROLLER },
} = require('./constants')

const getChatThread = async (id, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${CHAT_THREAD_CONTROLLER} getChatThread: fetching chat thread with id ${id}`,
        )
        return ChatThread.findById(id, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${CHAT_THREAD_CONTROLLER} getChatThread: ${e.message}`)
    throw new Error(e)
  }
}

const getChatThreads = async (where = {}, options = {}) => {
  try {
    const { trx, ...restOptions } = options

    return useTransaction(
      async tr => {
        logger.info(
          `${CHAT_THREAD_CONTROLLER} getChatThreads: fetching all chat threads based on where clause ${where} and provided options ${restOptions}`,
        )
        return ChatThread.find(where, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${CHAT_THREAD_CONTROLLER} getChatThreads: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  getChatThread,
  getChatThreads,
}
