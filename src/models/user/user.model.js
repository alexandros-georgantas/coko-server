const merge = require('lodash/merge')
const { Model } = require('objection')

const { model: PubsweetUser } = require('@pubsweet/model-user/src')
const logger = require('@pubsweet/logger')
const { ValidationError } = require('@pubsweet/errors')

const {
  arrayOfStrings,
  booleanDefaultFalse,
  booleanDefaultTrue,
  password,
  string,
  stringNotEmpty,
} = require('../_helpers/types')

class User extends PubsweetUser {
  constructor(properties) {
    super(properties)

    delete this.collections
    delete this.fragments
    delete this.teams
    delete this.email
  }

  /*
    Given names & surname are not required, as pre-migration users might not
    have them.

    Username & password are not required to allow for scenarios where a user
    has been created (eg. reviewer invitation), but they have not signed up yet.
  */
  static get schema() {
    return {
      type: 'object',
      required: [],
      properties: {
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
    const { Identity } = require('@pubsweet/models')

    return {
      identities: {
        relation: Model.HasManyRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
      },
      teams: {
        relation: PubsweetUser.ManyToManyRelation,
        modelClass: require.resolve('@pubsweet/model-team/src/team'),
        join: {
          from: 'users.id',
          through: {
            modelClass: require.resolve('@pubsweet/model-team/src/team_member'),
            from: 'team_members.user_id',
            to: 'team_members.team_id',
          },
          to: 'teams.id',
        },
      },
    }
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
