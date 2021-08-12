const BaseModel = require('../base.model')

const {
  boolean,
  dateNullable,
  email,
  id,
  object,
  stringNullable,
} = require('../_helpers/types')

class Identity extends BaseModel {
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
        email,
        isDefault: boolean,
        isSocial: boolean,
        isVerified: boolean,
        oauthAccessToken: stringNullable,
        oauthRefreshToken: stringNullable,
        profileData: object,
        provider: stringNullable,
        userId: id,
        verificationToken: stringNullable,
        verificationTokenTimestamp: dateNullable,
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
