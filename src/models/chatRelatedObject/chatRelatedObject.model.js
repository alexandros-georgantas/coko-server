const  BaseModel  = require('../BaseModel')

const { dateNotNullable, id, stringNotEmpty } = require('../_helpers/types')

/*
 * ChatRelatedObject model
*/

class ChatRelatedObject extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'chatRelatedObject'
  }

  static get tableName() {
    return 'chatRelatedObjects'
  }

  static get schema() {
    return {
      type: 'object',
      required: [],
      properties: {
        timestamp: dateNotNullable, // should only be used for migrations
      },
    }
  }

  // Let it accept timestamp to make migrations of old messages work
  $beforeInsert() {
    super.$beforeInsert()
    if (!this.timestamp) this.timestamp = this.created
  }
}

module.exports = ChatRelatedObject
