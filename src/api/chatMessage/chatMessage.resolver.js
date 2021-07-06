const logger = require('@pubsweet/logger')
const { ChatMessage } = require('@pubsweet/models')

const baseMessage = 'Chat Message:'

const resolvers = {
  ChatThread: {
    async messages(_, { input }, ctx) {
      const { chatThread } = input

      try {
        const messages = await ChatMessage.query()
          .where({
            chatThreadId: chatThread.id,
          })
          .orderBy('timestamp')

        return messages
      } catch (e) {
        logger.error(`${baseMessage} Chat thread Messages: Failed!`)
        throw new Error(e)
      }
    },
  },
  Mutation: {
    async sendChatMessage(_, { input }, ctx) {
      try {
        const { chatThreadId, content } = input
        const userId = ctx.user

        await ChatMessage.query().insert({
          chatThreadId,
          content,
          userId,
        })

        return true
      } catch (e) {
        logger.error(`${baseMessage} Send chat message: Failed!`)
        throw new Error(e)
      }
    },
  },
}

module.exports = { resolvers }
