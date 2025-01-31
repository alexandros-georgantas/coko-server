const BaseModel = require('../base.model')

const { id } = require('../_helpers/types')

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
        },
        relatedObjectId: id,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const ChatMessage = require('../chatMessage/chatMessage.model')

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
}

module.exports = ChatThread
