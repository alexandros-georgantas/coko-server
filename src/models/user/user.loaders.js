const logger = require('../../logger')
const User = require('./user.model')

const {
  labels: { USER_LOADER },
} = require('./constants')

const usersBasedOnTeamMemberIdsLoader = async userIds => {
  try {
    const teamMemberUsers = await User.query().whereIn('id', userIds)

    return userIds.map(userId =>
      teamMemberUsers.find(user => user.id === userId),
    )
  } catch (e) {
    logger.error(`${USER_LOADER} usersBasedOnTeamMemberIdsLoader: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  usersBasedOnTeamMemberIdsLoader,
}
