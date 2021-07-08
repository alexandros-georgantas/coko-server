const clone = require('lodash/clone')
const config = require('config')
const crypto = require('crypto')
const moment = require('moment')
const { transaction } = require('objection')

const logger = require('@pubsweet/logger')

const {
  AuthorizationError,
  ConflictError,
  ValidationError,
} = require('@pubsweet/errors')

const { createJWT } = require('../../index')

// const { auth, notify } = require('../../services')

const resolvers = {
  ChatMessage: {
    async user(_, { input }, ctx) {
      // eslint-disable-next-line global-require
      const { User } = require('@pubsweet/models')
      const { chatMessage } = input

      try {
        const user = await User.findById(chatMessage.userId)
        return user
      } catch (e) {
        logger.error('User: Chat message user: Failed!')
        throw new Error(e)
      }
    },
  },

  User: {
    async displayName(user, { input }, ctx) {
      // eslint-disable-next-line global-require
      const { User } = require('@pubsweet/models')
      return User.getDisplayName(user)
    },
  },

  Query: {
    async validatePasswordTokenExpiry(_, { token }) {
      try {
        // eslint-disable-next-line global-require
        const { User } = require('@pubsweet/models')
        const user = await User.query().findOne({ passwordResetToken: token })

        if (!user) {
          logger.error(
            `Validate password token: No user found with token ${token}`,
          )
          throw new Error('Something went wrong!')
        }

        if (
          moment().subtract(24, 'hours').isAfter(user.passwordResetTimestamp)
        ) {
          return false
        }

        return true
      } catch (e) {
        logger.error(
          'User: Validate password token expiry: Something went wrong',
        )
        throw new Error(e)
      }
    },

    async currentUserWithIdentity(_, { input }, ctx) {
      const userId = ctx.user
      if (!userId) throw new Error('Current User: No user id provided')
      // eslint-disable-next-line global-require
      const { Identity, User } = require('@pubsweet/models')
      const user = await User.findById(userId)

      // XXX add AUTH attribute back in later.
      // const { createClientAuth } = auth
      // user.auth = await createClientAuth(userId)

      const identity = await Identity.query().findOne({
        isDefault: true,
        userId: user.id,
      })

      user.orcid = identity.orcid
      user.email = identity.email

      return user
    },

    async usersWithIdentities(_, __, ctx) {
      // eslint-disable-next-line global-require
      const { Identity, User } = require('@pubsweet/models')
      const all = await User.query()

      const withIdentity = all.map(async u => {
        const identityDefault = await Identity.query().findOne({
          userId: u.id,
          isDefault: true,
        })

        // Just find all of them.
        const identityAny = await Identity.query().where({ userId: u.id })
        // eslint-disable-next-line no-param-reassign
        u.defaultIdentity = identityDefault
        // eslint-disable-next-line no-param-reassign
        u.identities = identityAny
        return { ...u }
      })

      return withIdentity
    },
  },

  Mutation: {
    async login(_, { input }, ctx) {
      const { username, password } = input
      let isValid = false
      let user

      try {
        // eslint-disable-next-line global-require
        const { Identity, User } = require('@pubsweet/models')
        user = await User.query().findOne({ username })
        if (!user) throw new AuthorizationError('Wrong username or password.')

        isValid = await user.validPassword(password)

        if (!isValid) {
          throw new AuthorizationError('Wrong username or password.')
        }

        const identities = await Identity.query().where({ userId: user.id })
        const isConfirmed = identities.some(id => id.isConfirmed)
        if (!isConfirmed) throw new Error('Login: Identity not confirmed')

        return {
          token: createJWT(user),
        }
      } catch (e) {
        logger.error('Login: Failed!')
        throw new Error(e)
      }
    },

    async sendPasswordResetEmail(_, { email }, ctx) {
      // eslint-disable-next-line global-require
      const { Identity, User } = require('@pubsweet/models')

      // // fail early if these configs are missing
      const baseUrl = config.get('pubsweet-server.baseUrl')

      const pathToPage = config.has('password-reset.pathToPage')
        ? config.get('password-reset.pathToPage')
        : '/password-reset'

      const tokenLength = config.has('password-reset.token-length')
        ? config.get('password-reset.token-length')
        : 32

      const identity = await Identity.query().findOne({
        isDefault: true,
        email: email.toLowerCase(),
      })

      if (!identity) {
        return true
      }

      const user = await User.query().findById(identity.userId)

      const resetToken = crypto.randomBytes(tokenLength).toString('hex')

      await user.$query().patch({
        passwordResetTimestamp: new Date(),
        passwordResetToken: resetToken,
      })

      const passwordResetURL = `${baseUrl}${pathToPage}/${resetToken}`

      logger.info(
        `Sending password reset email to ${identity.email} using ${passwordResetURL}`,
      )

      return true
    },

    async resendVerificationEmail(_, { token }) {
      try {
        // eslint-disable-next-line global-require
        const { Identity } = require('@pubsweet/models')

        const identity = await Identity.query().findOne({
          confirmationToken: token,
        })

        if (!identity)
          throw new Error(
            'Resend Verification Email: Token does not correspond to an identity',
          )

        const confirmationToken = crypto.randomBytes(64).toString('hex')
        const confirmationTokenTimestamp = new Date()

        await identity.$query().patch({
          confirmationToken,
          confirmationTokenTimestamp,
        })

        return true
      } catch (e) {
        logger.error('Resend Verification Email: Something went wrong')
        throw new Error(e)
      }
    },

    async resendVerificationEmailFromLogin(_, { username, password }) {
      try {
        // eslint-disable-next-line global-require
        const { Identity, User } = require('@pubsweet/models')

        const user = await User.query().findOne({ username })
        if (!user)
          throw new Error(
            `Resend Verification Email From Login: No user with username ${username} found`,
          )

        const identity = await Identity.query().findOne({
          isDefault: true,
          userId: user.id,
        })

        if (!identity)
          throw new Error(
            `Resend Verification Email From Login: No default identity found for user with id ${user.id}`,
          )

        const confirmationToken = crypto.randomBytes(64).toString('hex')
        const confirmationTokenTimestamp = new Date()

        await identity.$query().patch({
          confirmationToken,
          confirmationTokenTimestamp,
        })

        return true
      } catch (e) {
        logger.error(
          'Resend Verification Email From Login: Something went wrong',
        )
        throw new Error(e)
      }
    },

    async resetPassword(_, { token, password }, ctx) {
      // eslint-disable-next-line global-require
      const { User } = require('@pubsweet/models')
      const user = await User.query().findOne({ passwordResetToken: token })

      if (!user) {
        logger.error(
          `Validate password token: No user found with token ${token}`,
        )
        throw new Error('Something went wrong!')
      }

      if (moment().subtract(24, 'hours').isAfter(user.passwordResetTimestamp)) {
        throw new ValidationError('Your token has expired')
      }

      await user.$query().patch({
        password,
        passwordResetTimestamp: null,
        passwordResetToken: null,
      })

      return true
    },

    async signUp(_, { input }, ctx) {
      // eslint-disable-next-line global-require
      const { Identity, User } = require('@pubsweet/models')
      const userInput = clone(input)

      const { email, givenNames, password, surname, username, orcid } =
        userInput

      const usernameExists = await User.query().findOne({ username })

      if (usernameExists) {
        logger.error('Sign up: Username already exists')
        throw new ConflictError('Username already exists')
      }

      const existingIdentity = await Identity.query().findOne({ email })

      if (existingIdentity) {
        const user = await User.query().findById(existingIdentity.userId)

        if (user.agreedTc) {
          logger.error('Sign up: A user with this email already exists')
          throw new ConflictError('A user with this email already exists')
        }

        // If not agreed to tc, user's been invited but is now signing up
        delete userInput.email
        delete userInput.orcid

        try {
          let updatedUser, confirmationToken

          await transaction(User.knex(), async trx => {
            updatedUser = await User.query(trx).patchAndFetchById(
              existingIdentity.userId,
              {
                ...userInput,
                agreedTc: true,
              },
            )

            confirmationToken = crypto.randomBytes(64).toString('hex')
            const confirmationTokenTimestamp = new Date()

            await existingIdentity.$query(trx).patch({
              confirmationToken,
              confirmationTokenTimestamp,
              orcid,
            })
          })

          return updatedUser
        } catch (e) {
          throw new Error(e)
        }
      }

      if (!existingIdentity) {
        try {
          let newUser
          const knex = User.knex()

          await transaction(knex, async trx => {
            newUser = await User.query(trx).insert({
              agreedTc: true,
              givenNames,
              password,
              surname,
              username,
            })

            const confirmationToken = crypto.randomBytes(64).toString('hex')
            const confirmationTokenTimestamp = new Date()

            await Identity.query(trx).insert({
              confirmationToken,
              confirmationTokenTimestamp,
              email,
              isConfirmed: false,
              isDefault: true,
              userId: newUser.id,
              orcid,
            })
          })

          return User.findById(newUser.id)
        } catch (e) {
          logger.error('Signup: User creation failed! Rolling back...')
          throw new Error(e)
        }
      }

      // We wouldn't get here anyway.
      return false
    },

    async updatePassword(_, { input }, ctx) {
      // eslint-disable-next-line global-require
      const { User } = require('@pubsweet/models')
      const userId = ctx.user
      const { currentPassword, newPassword } = input

      try {
        const u = await User.updatePassword(
          userId,
          currentPassword,
          newPassword,
        )

        return u.id
      } catch (e) {
        throw new Error(e)
      }
    },

    async updatePersonalInformation(_, { input }, ctx) {
      // eslint-disable-next-line global-require
      const { Identity, User } = require('@pubsweet/models')
      const { givenNames, surname, orcid } = input
      const userId = input.userId || ctx.user

      await Identity.query().patch({ orcid }).where({
        isDefault: true,
        userId,
      })

      return User.query().patchAndFetchById(userId, {
        givenNames,
        surname,
      })
    },

    async updateUsername(_, { input }, ctx) {
      // eslint-disable-next-line global-require
      const { User } = require('@pubsweet/models')
      const { username } = input
      const userId = input.userId || ctx.user

      return User.query().patchAndFetchById(userId, { username })
    },

    async verifyEmail(_, { token }, ctx) {
      try {
        // eslint-disable-next-line global-require
        const { Identity } = require('@pubsweet/models')

        const identity = await Identity.query().findOne({
          confirmationToken: token,
        })

        if (!identity) throw new Error('Verify email: Invalid token')

        if (identity.isConfirmed)
          throw new Error('Verify email: Identity has already been confirmed')

        if (!identity.confirmationTokenTimestamp) {
          throw new Error(
            'Verify email: Confirmation token does not have a corresponding timestamp',
          )
        }

        if (
          moment()
            // .subtract(5, 'seconds')
            .subtract(24, 'hours')
            .isAfter(identity.confirmationTokenTimestamp)
        ) {
          throw new Error('Verify email: Token expired')
        }

        await identity.$query().patch({
          isConfirmed: true,
        })

        return true
      } catch (e) {
        throw new Error(e)
      }
    },
  },
}

module.exports = { resolvers }
