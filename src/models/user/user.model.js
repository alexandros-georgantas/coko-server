const bcrypt = require('bcrypt')
const config = require('config')
const { ValidationError } = require('@pubsweet/errors')
const { logger } = require('@pubsweet/logger')

const BCRYPT_COST = config.util.getEnv('NODE_ENV') === 'test' ? 1 : 12

const BaseModel = require('../base.model')
const useTransaction = require('../../useTransaction')

const {
  alphaNumericStringNotNullable,
  booleanDefaultTrue,
  dateNullable,
  password,
  string,
  stringNotEmpty,
  stringNullable,
} = require('../_helpers/types')

class User extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'user'
  }

  static get tableName() {
    return 'users'
  }

  // Username & password are not required to allow for scenarios where a user
  // has been created (eg. reviewer invitation), but they have not signed up yet.

  static get schema() {
    return {
      type: 'object',
      required: [],
      properties: {
        username: alphaNumericStringNotNullable,
        passwordHash: stringNotEmpty,
        passwordResetToken: stringNullable,
        passwordResetTimestamp: dateNullable,
        agreedTc: booleanDefaultTrue,
        isActive: booleanDefaultTrue,
        invitationToken: stringNotEmpty,
        invitationTokenTimestamp: dateNullable,
        password,
        givenNames: string,
        surname: string,
        titlePre: string,
        titlePost: string,
      },
    }
  }

  static get relationMappings() {
    // eslint-disable-next-line global-require
    const { Identity, Team, TeamMember } = require('@pubsweet/models')

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

  static async hasGlobalRole(userId, role, options = {}) {
    /* eslint-disable-next-line global-require, no-shadow */
    const { TeamMember } = require('@pubsweet/models')

    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const isMember = await TeamMember.query(tr)
            .leftJoin('teams', 'team_members.teamId', 'teams.id')
            .findOne({
              global: true,
              role,
              userId,
            })

          return !!isMember
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: hasGlobalRole failed', e)
      throw new Error(e)
    }
  }

  async hasGlobalRole(role, options = {}) {
    return User.hasGlobalRole(this.id, role, options)
  }

  static async hasRoleOnObject(userId, role, objectId, options = {}) {
    /* eslint-disable-next-line global-require, no-shadow */
    const { TeamMember } = require('@pubsweet/models')

    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const isMember = await TeamMember.query(tr)
            .leftJoin('teams', 'team_members.teamId', 'teams.id')
            .findOne({
              role,
              userId,
              objectId,
            })

          return !!isMember
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: hasRoleOnObject failed', e)
      throw new Error(e)
    }
  }

  async hasRoleOnObject(role, objectId, options = {}) {
    return User.hasRoleOnObject(this.id, role, objectId, options)
  }

  static async getDisplayName(user) {
    if (!user) throw new Error('User model: getDisplayName: No user provided')

    const { givenNames, surname, username } = user
    if (givenNames && surname) return `${givenNames} ${surname}`
    if (username) return username

    throw new Error('User model: Cannot get displayName')
  }

  static async updatePassword(
    userId,
    currentPassword,
    newPassword,
    options = {},
  ) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const user = await User.query(tr).findById(userId)

          const isCurrentPasswordValid = await user.isPasswordValid(
            currentPassword,
          )

          if (!isCurrentPasswordValid) {
            throw new ValidationError(
              'Update password: Current password is not valid',
            )
          }

          if (await user.isPasswordValid(newPassword)) {
            throw new ValidationError(
              'Update password: New password must be different from current password',
            )
          }

          return user.$query(tr).patchAndFetch({
            password: newPassword,
          })
        },
        { trx },
      )
    } catch (e) {
      logger.error('User model: updatePassword failed', e)
      throw new Error('User model: Cannot update password')
    }
  }

  $formatJson(json) {
    // eslint-disable-next-line no-param-reassign
    json = super.$formatJson(json)
    // eslint-disable-next-line no-param-reassign
    delete json.passwordHash
    return json
  }

  static async hashPassword(plaintext) {
    return bcrypt.hash(plaintext, BCRYPT_COST)
  }

  async hashPassword(plaintext) {
    this.passwordHash = await bcrypt.hash(plaintext, BCRYPT_COST)
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

  async isPasswordValid(plaintext) {
    return plaintext && this.passwordHash
      ? bcrypt.compare(plaintext, this.passwordHash)
      : false
  }
}

module.exports = User
