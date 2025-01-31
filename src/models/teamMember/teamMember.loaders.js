const logger = require('../../logger')

const TeamMember = require('./teamMember.model')

const {
  labels: { TEAM_MEMBER_LOADER },
} = require('./constants')

const teamMembersBasedOnTeamIdsLoader = async teamIds => {
  try {
    const membersOfAllTeams = await TeamMember.query().whereIn(
      'teamId',
      teamIds,
    )

    return teamIds.map(teamId => {
      const membersOfThisTeam = membersOfAllTeams.filter(
        member => member.teamId === teamId,
      )

      return membersOfThisTeam
    })
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
