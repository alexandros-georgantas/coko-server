const logger = require('../../logger')
const Identity = require('./identity.model')

const {
  labels: { IDENTITY_LOADER },
} = require('./constants')

const identitiesBasedOnUserIdsLoader = async userIds => {
  try {
    const userIdentities = await Identity.query().whereIn('userId', userIds)
    return userIds.map(userId =>
      userIdentities.filter(identity => identity.userId === userId),
    )
  } catch (e) {
    logger.error(
      `${IDENTITY_LOADER} identitiesBasedOnUserIdsLoader: ${e.message}`,
    )
    throw new Error(e)
  }
}

const defaultIdentityBasedOnUserIdsLoader = async userIds => {
  try {
    const userIdentities = await Identity.query()
      .whereIn('userId', userIds)
      .andWhere({ isDefault: true })

    return userIds.map(userId =>
      userIdentities.find(identity => identity.userId === userId),
    )
  } catch (e) {
    logger.error(
      `${IDENTITY_LOADER} defaultIdentityBasedOnUserIdsLoader: ${e.message}`,
    )
    throw new Error(e)
  }
}

module.exports = {
  identitiesBasedOnUserIdsLoader,
  defaultIdentityBasedOnUserIdsLoader,
}
