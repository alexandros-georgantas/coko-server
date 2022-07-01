const { logger } = require('../../index')

const {
  labels: { TEAM_RESOLVER },
} = require('./constants')

const {
  getTeam,
  getTeams,
  getGlobalTeams,
  getObjectTeams,
  updateTeamMembership,
  addTeamMember,
  removeTeamMember,
  // deleteTeam,
} = require('./team.controller')

const teamResolver = async (_, { id }, ctx) => {
  try {
    logger.info(`${TEAM_RESOLVER} team`)
    return getTeam(id)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} team: ${e.message}`)
    throw new Error(e)
  }
}

const teamsResolver = async (_, { where }, ctx) => {
  try {
    logger.info(`${TEAM_RESOLVER} teams`)
    return getTeams(where)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} teams: ${e.message}`)
    throw new Error(e)
  }
}

const getGlobalTeamsResolver = async (_, { where }, ctx) => {
  try {
    logger.info(`${TEAM_RESOLVER} getGlobalTeams`)
    return getGlobalTeams()
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} getGlobalTeams: ${e.message}`)
    throw new Error(e)
  }
}

const getObjectTeamsResolver = async (_, { objectId, objectType }, ctx) => {
  try {
    logger.info(`${TEAM_RESOLVER} getObjectTeams`)
    return getObjectTeams(objectId, objectType)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} getObjectTeams: ${e.message}`)
    throw new Error(e)
  }
}

const updateTeamMembershipResolver = async (_, { teamId, members }, ctx) => {
  try {
    logger.info(`${TEAM_RESOLVER} updateTeamMembership`)
    return updateTeamMembership(teamId, members)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} updateTeamMembership: ${e.message}`)
    throw new Error(e)
  }
}

const addTeamMemberResolver = async (_, { teamId, userId }, ctx) => {
  try {
    logger.info(`${TEAM_RESOLVER} addTeamMember`)
    return addTeamMember(teamId, userId)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} addTeamMember: ${e.message}`)
    throw new Error(e)
  }
}

const removeTeamMemberResolver = async (_, { teamId, userId }, ctx) => {
  try {
    logger.info(`${TEAM_RESOLVER} removeTeamMember`)
    return removeTeamMember(teamId, userId)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} removeTeamMember: ${e.message}`)
    throw new Error(e)
  }
}

// const deleteTeamResolver = async (_, { id }, ctx) => {
//   try {
//     logger.info(`${TEAM_RESOLVER} deleteTeam`)
//     return deleteTeam(id)
//   } catch (e) {
//     logger.error(`${TEAM_RESOLVER} deleteTeam: ${e.message}`)
//     throw new Error(e)
//   }
// }

const teamMemberResolver = async (team, _, ctx) => {
  const { id } = team
  return ctx.loaders.TeamMember.teamMembersBasedOnTeamIdsLoader.load(id)
}

module.exports = {
  Query: {
    team: teamResolver,
    teams: teamsResolver,
    getGlobalTeams: getGlobalTeamsResolver,
    getObjectTeams: getObjectTeamsResolver,
  },
  Mutation: {
    updateTeamMembership: updateTeamMembershipResolver,
    addTeamMember: addTeamMemberResolver,
    removeTeamMember: removeTeamMemberResolver,
    // deleteTeam:deleteTeamResolver,
  },
  Team: {
    members: teamMemberResolver,
  },
}
