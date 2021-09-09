const { logger } = require('@pubsweet/logger')

const { TeamMember } = require('../index')

const {
  labels: { TEAM_MEMBER_LOADER },
} = require('./constants')

const teamMembersBasedOnTeamIdsLoader = async teamIds => {
  try {
    const teamTeamMembers = await TeamMember.query().whereIn('teamId', teamIds)
    return teamIds.map(teamId =>
      teamTeamMembers.find(teamMember => teamMember.teamId === teamId),
    )
  } catch (e) {
    logger.error(
      `${TEAM_MEMBER_LOADER} teamMembersBasedOnTeamIdsLoader: ${e.message}`,
    )
    throw new Error(e)
  }
}

module.exports = {
  teamMembersBasedOnTeamIdsLoader,
}
