const BaseModel = require('../BaseModel')

const logger = require('@pubsweet/logger')

const { id } = require('../_helpers/types')

const baseMessage = 'Chat Thread Model:'

class ChatThread extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'chatThread'
  }

  static get tableName() {
    return 'chatThreads'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['chatType', 'relatedObjectId'],
      properties: {
        chatType: {
          type: 'string',
          enum: ['scienceOfficer', 'reviewer', 'author', 'curator'],
        },
	relatedObjectId: id,
        userId: id,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { ChatMessage } = require('@pubsweet/models')

    return {
      messages: {
        relation: BaseModel.HasManyRelation,
        modelClass: ChatMessage,
        join: {
          from: 'chatMessages.chatThreadId',
          to: 'chatThreads.id',
        },
      },
    }
  }

  static async createCuratorThread(relatedObjectId, curatorId, options = {}) {
    try {
      const { trx } = options

      const curatorThread = await this.query(trx).findOne({
	relatedObjectId,
        userId: curatorId,
        chatType: 'curator',
      })

      if (curatorThread) return null // thread already exists

      return this.query(trx).insert({
	relatedObjectId,
        userId: curatorId,
        chatType: 'curator',
      })
    } catch (e) {
      logger.error(`${baseMessage} Create curator thread failed!`)
      throw new Error(e)
    }
  }
}

module.exports = ChatThread
