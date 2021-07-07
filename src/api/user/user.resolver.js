const logger = require('@pubsweet/logger')
const { AuthorizationError, ConflictError } = require('@pubsweet/errors')

const eager = undefined

//
// Pubsweet User resolvers
//

const resolvers = {
  Query: {
    user(_, { id }, ctx) {
      return ctx.connectors.User.fetchOne(id, ctx, { eager })
    },
    users(_, { where }, ctx) {
      return ctx.connectors.User.fetchAll(where, ctx, { eager })
    },
    // Authentication
    currentUser(_, vars, ctx) {
      if (!ctx.user) return null
      return ctx.connectors.User.model.find(ctx.user, { eager })
    },
  },
  Mutation: {
    async createUser(_, { input }, ctx) {
      const user = {
        username: input.username,
        passwordHash: await ctx.connectors.User.model.hashPassword(
          input.password,
        ),
      }

      const identity = {
        type: 'local',
        aff: input.aff,
        name: input.name,
        isDefault: true,
        email: input.email,
        isConfirmed: false,
      }

      user.defaultIdentity = identity

      try {
        const result = await ctx.connectors.User.create(user, ctx, {
          eager: 'defaultIdentity',
        })

        return result
      } catch (e) {
        if (e.constraint) {
          throw new ConflictError(
            'User with this username or email already exists',
          )
        } else {
          throw e
        }
      }
    },
    deleteUser(_, { id }, ctx) {
      return ctx.connectors.User.delete(id, ctx)
    },
    async updateUser(_, { id, input }, ctx) {
      if (input.password) {
        // eslint-disable-next-line no-param-reassign
        input.passwordHash = await ctx.connectors.User.model.hashPassword(
          input.password,
        )
        // eslint-disable-next-line no-param-reassign
        delete input.password
      }

      if (input.email) {
        // eslint-disable-next-line no-param-reassign
        delete input.email
      }

      return ctx.connectors.User.update(id, input, ctx)
    },
    // Authentication
    async loginUser(_, { input }, ctx) {
      // eslint-disable-next-line global-require
      const authentication = require('pubsweet-server/src/authentication')

      let isValid = false
      let user

      try {
        user = await ctx.connectors.User.model.findByUsername(input.username)
        isValid = await user.validPassword(input.password)
      } catch (err) {
        logger.debug(err)
      }

      if (!isValid) {
        throw new AuthorizationError('Wrong username or password.')
      }

      return {
        user,
        token: authentication.token.create(user),
      }
    },
  },
  Local: {
    __isTypeOf: (obj, context, info) => obj.type === 'local',
    async email(obj, args, ctx, info) {
      // Emails stored on identity, surfaced in local identity too
      // XXX not checking if local or external!!
      return (
        await ctx.connectors.User.model.find(obj.userId, {
          eager: 'defaultIdentity',
        })
      ).defaultIdentity.email
    },
  },
  External: {
    __isTypeOf: (obj, context, info) => obj.type === 'external',
    async email(obj, args, ctx, info) {
      // Emails stored on identity, surfaced in external identity too
      // XXX not checking if local or external!!
      return (
        await ctx.connectors.User.model.find(obj.userId, {
          eager: 'defaultIdentity',
        })
      ).defaultIdentity.email
    },
  },
}

module.exports = { resolvers }
