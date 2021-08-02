const find = require('lodash/find')
const forEach = require('lodash/forEach')
const { ValidationError } = require('objection')
const BaseModel = require('../base.model')

const {
  id,
  stringNotEmpty,
  booleanDefaultFalse,
  arrayOfIds,
} = require('../_helpers/types')

const checkUserIsMemberOfTeam = async (mentions, chatThreadId, transaction) => {
  /* eslint-disable-next-line global-require */
  const { Team } = require('../index')

  const team = await Team.findOne(
    { objectId: chatThreadId, objectType: 'chatThread' },
    { trx: transaction, related: 'users' },
  )

  forEach(mentions, userId => {
    const found = find(team.users, { id: userId })

    if (!found) {
      throw new ValidationError({
        type: 'ModelValidation',
        message: `User with id ${userId} is not a member of this chat thread team`,
      })
    }
  })

  return true
}

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
        mentions: arrayOfIds,
        isDeleted: booleanDefaultFalse,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { User } = require('../index')

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

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)

    if (this.mentions.length > 0) {
      await checkUserIsMemberOfTeam(
        this.mentions,
        this.chatThreadId,
        queryContext.transaction,
      )
    }
  }

  async $beforeUpdate(queryContext) {
    await super.$beforeUpdate(queryContext)

    if (this.mentions.length > 0) {
      await checkUserIsMemberOfTeam(
        this.mentions,
        this.chatThreadId,
        queryContext.transaction,
      )
    }
  }
}

module.exports = ChatMessage
