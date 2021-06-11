const { Identity: PubsweetIdentity } = require('@pubsweet/models')

const {
  boolean,
  dateNullable,
  email,
  id,
  stringNullable,
} = require('../_helpers/types')

class Identity extends PubsweetIdentity {
  constructor(properties) {
    super(properties)
    this.type = 'identity'
  }

  static get tableName() {
    return 'identities'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['email', 'userId'],
      properties: {
        userId: id,
        email,
        isDefault: boolean,
        isConfirmed: boolean,
        confirmationToken: stringNullable,
        confirmationTokenTimestamp: dateNullable,
        orcid: stringNullable,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const { User } = require('@pubsweet/models')

    return {
      user: {
        relation: PubsweetIdentity.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'identities.userId',
          to: 'users.id',
        },
      },
    }
  }

  $formatDatabaseJson(json) {
    // eslint-disable-next-line no-param-reassign
    json = super.$formatDatabaseJson(json)
    const emailValue = json.email
    if (emailValue) return { ...json, email: emailValue.toLowerCase() }
    return { ...json }
  }
}

module.exports = Identity
