const BaseModel = require('../BaseModel')

const { id, stringNotEmpty } = require('../_helpers/types')

class ChatMessage extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'chatMessage'
  }

  static get tableName() {
    return 'chatMessages'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['content', 'chatThreadId', 'userId'],
      properties: {
        content: stringNotEmpty,
        chatThreadId: id,
        userId: id,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { User } = require('@pubsweet/models')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'chatMessages.userId',
          to: 'users.id',
        },
      },
    }
  }
}

module.exports = ChatMessage
