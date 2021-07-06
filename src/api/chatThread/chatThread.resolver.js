const logger = require('@pubsweet/logger')
const { ChatThread } = require('@pubsweet/models')

const baseMessage = 'Chat Thread:'

const resolvers = {
  RelatedObject: {
    async chatThreads(relatedObject, { currentUserOnly, type }, ctx) {
      try {
        const userId = ctx.user
        const conditions = { relatedObjectId: relatedObject.id }
        if (type) conditions.chatType = type
        if (currentUserOnly) conditions.userId = userId

        const threads = await ChatThread.query().where(conditions)
        return threads
      } catch (e) {
        logger.error(`${baseMessage} relatedObject chat threads: Failed!`)
        throw new Error(e)
      }
    },
  },
}

module.exports = { resolvers }
