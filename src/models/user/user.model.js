const merge = require('lodash/merge')
const logger = require('@pubsweet/logger')
const { ValidationError } = require('@pubsweet/errors')
const BaseModel = require('../BaseModel')

const {
  arrayOfStrings,
  booleanDefaultFalse,
  booleanDefaultTrue,
  password,
  string,
  stringNotEmpty,
} = require('../_helpers/types')

class User extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'user'
  }

  static get tableName() {
    return 'users'
  }

  /*
    Username & password are not required to allow for scenarios where a user
    has been created (eg. reviewer invitation), but they have not signed up yet.
  */
  static get schema() {
    return {
      type: 'object',
      required: [],
      properties: {
        email: { type: 'string', format: 'email' },
        username: { type: 'string', pattern: '^[a-zA-Z0-9]+' },
        passwordHash: { type: 'string' },
        passwordResetToken: { type: ['string', 'null'] },
        passwordResetTimestamp: {
          type: ['string', 'object', 'null'],
          format: 'date-time',
        },
        admin: booleanDefaultFalse,
        // TO DO -- temporarily set implicitly to true, until we have the tc
        agreedTc: booleanDefaultTrue,
        isActive: booleanDefaultTrue,
        affiliations: arrayOfStrings,
        invitationToken: stringNotEmpty,
        password,

        // temp, to allow existing external users to be migrated
        givenNames: string,
        surname: stringNotEmpty,
        titlePre: stringNotEmpty,
        titlePost: stringNotEmpty,
      },
    }
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require, no-shadow */
    const { Team, TeamMember, Identity } = require('@pubsweet/models')

    return {
      identities: {
        relation: BaseModel.HasManyRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
      },
      defaultIdentity: {
        relation: BaseModel.HasOneRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
        filter: builder => {
          builder.where('isDefault', true)
        },
      },

      teams: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Team,
        join: {
          from: 'users.id',
          through: {
            modelClass: TeamMember,
            from: 'team_members.user_id',
            to: 'team_members.team_id',
          },
          to: 'teams.id',
        },
      },
    }
  }

  // From https://gitlab.coko.foundation/ncbi/ncbi/-/blob/develop/server/models/user/user.js#L61-101

  static async hasGlobalRole(userId, role) {
    /* eslint-disable-next-line global-require, no-shadow */
    const { TeamMember } = require('@pubsweet/models')

    try {
      const isMember = await TeamMember.query()
        .leftJoin('teams', 'team_members.teamId', 'teams.id')
        .findOne({
          global: true,
          role,
          userId,
        })

      return !!isMember
    } catch (e) {
      logger.error('User model: hasGlobalRole failed', e)
      throw new Error(e)
    }
  }

  async hasGlobalRole(role) {
    return User.hasGlobalRole(this.id, role)
  }

  static async hasRoleOnObject(userId, role, objectId) {
    /* eslint-disable-next-line global-require, no-shadow */
    const { TeamMember } = require('@pubsweet/models')

    try {
      const isMember = await TeamMember.query()
        .leftJoin('teams', 'team_members.teamId', 'teams.id')
        .findOne({
          role,
          userId,
          objectId,
        })

      return !!isMember
    } catch (e) {
      logger.error('User model: hasRoleOnObject failed', e)
      throw new Error(e)
    }
  }

  async hasRoleOnObject(role, objectId) {
    return User.hasRoleOnObject(this.id, role, objectId)
  }

  static async findById(userId) {
    const user = await User.query().findById(userId)

    const res = merge(user, { displayName: this.getDisplayName(user) })

    return res
  }

  static async getDisplayName(user) {
    if (!user) throw new Error('User model: getDisplayName: No user provided')

    const { givenNames, surname, username } = user
    if (givenNames && surname) return `${givenNames} ${surname}`
    if (username) return username

    throw new Error('User model: Cannot get displayName')
  }

  static async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.query().findById(userId)
    const isCurrentPasswordValid = await user.validPassword(currentPassword)

    if (!isCurrentPasswordValid) {
      throw new ValidationError(
        'Update password: Current password is not valid',
      )
    }

    if (await user.validPassword(newPassword)) {
      throw new ValidationError(
        'Update password: New password must be different from current password',
      )
    }

    return user.$query().patchAndFetch({
      password: newPassword,
    })
  }

  $formatJson(json) {
    // eslint-disable-next-line no-param-reassign
    json = super.$formatJson(json)
    // eslint-disable-next-line no-param-reassign
    delete json.passwordHash
    return json
  }

  async hashPassword(pwd) {
    this.passwordHash = await User.hashPassword(pwd)
    delete this.password
  }

  async $beforeInsert(queryContext) {
    super.$beforeInsert()
    if (this.password) await this.hashPassword(this.password)
  }

  async $beforeUpdate() {
    super.$beforeUpdate()
    if (this.password) await this.hashPassword(this.password)
  }

  // ** validPassword() returns a promise, needs to be used with await

  /* eslint-disable class-methods-use-this */
  async save() {
    logger.error('User model: save method has been disabled')
  }

  // Email does not exist on User, but on Identity
  static findByEmail() {
    logger.error('User model: findByEmail method has been disabled')
  }

  // Owners is not used
  static ownersWithUsername(object) {
    logger.error('User model: ownersWithUsernames method has been disabled')
  }
  /* eslint-enable class-methods-use-this */
}

module.exports = User
