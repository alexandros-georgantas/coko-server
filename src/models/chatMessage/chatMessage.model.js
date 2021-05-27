const  BaseModel  = require('../BaseModel')

const { dateNotNullable, id, stringNotEmpty } = require('../_helpers/types')

/*
  Added a 'timestamp' field, instead of using 'created'.
  This is becase the migrations would have made all existing chat messages
  as created 'now' and I didn't want to tamper with the current 'created' field,
  as it can serve an important auditing role.
*/

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
        timestamp: dateNotNullable, // should only be used for migrations
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

  // Let it accept timestamp to make migrations of old messages work
  $beforeInsert() {
    super.$beforeInsert()
    if (!this.timestamp) this.timestamp = this.created
  }
}

module.exports = ChatMessage
