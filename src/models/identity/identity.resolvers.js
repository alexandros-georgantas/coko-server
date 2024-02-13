const logger = require('../../logger')
const pubsubManager = require('../../graphql/pubsub')

const {
  createOAuthIdentity,
  hasValidRefreshToken,
} = require('./identity.controller')

const { getUser } = require('../user/user.controller')

const {
  labels: { IDENTITY_RESOLVER },
} = require('./constants')

const {
  subscriptions: { USER_UPDATED },
} = require('../user/constants')

const createOAuthIdentityResolver = async (
  _,
  { provider, sessionState, code },
  ctx,
) => {
  try {
    logger.info(`${IDENTITY_RESOLVER} createOAuthIdentity`)
    const userId = ctx.user

    const identity = await createOAuthIdentity(
      userId,
      provider,
      sessionState,
      code,
    )

    const pubsub = await pubsubManager.getPubsub()
    const user = await getUser(userId)

    pubsub.publish(USER_UPDATED, {
      userUpdated: user,
    })

    return identity
  } catch (e) {
    logger.error(`${IDENTITY_RESOLVER} createOAuthIdentity: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  Mutation: {
    createOAuthIdentity: createOAuthIdentityResolver,
  },
  Identity: {
    hasValidRefreshToken,
  },
}
