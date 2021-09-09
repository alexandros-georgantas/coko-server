const { Team } = require('../index')
const { logger, useTransaction } = require('../../index')
const { labels: TEAM_CONTROLLER } = require('./constants')

const getTeam = async (id, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(`${TEAM_CONTROLLER} getTeam: fetching team with id ${id}`)
        return Team.findById(id, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} getTeam: ${e.message}`)
    throw new Error(e)
  }
}

const getTeams = async (where = {}, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${TEAM_CONTROLLER} getTeams: fetching all teams based on where clause ${where} and provided options ${restOptions}`,
        )
        return Team.find(where, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} getTeams: ${e.message}`)
    throw new Error(e)
  }
}

const getGlobalTeams = async (options = {}) => {
  try {
    logger.info(
      `${TEAM_CONTROLLER} getGlobalTeams: fetching all teams with flag global`,
    )
    return getTeams({ global: true }, options)
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} getGlobalTeams: ${e.message}`)
    throw new Error(e)
  }
}

const getObjectTeams = async (objectId, objectType, options = {}) => {
  try {
    logger.info(
      `${TEAM_CONTROLLER} getObjectTeams: fetching all teams of object with id ${objectId} and type ${objectType}`,
    )
    return getTeams({ objectId, objectType }, options)
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} getObjectTeams: ${e.message}`)
    throw new Error(e)
  }
}

const addTeamMember = async (teamId, userId, options = {}) => {
  try {
    const { trx } = options
    // notify
    return useTransaction(
      async tr => {
        logger.info(
          `${TEAM_CONTROLLER} addTeamMember: adding user with id ${userId} to team with id ${teamId}`,
        )
        return Team.addMember(teamId, userId, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} addTeamMember: ${e.message}`)
    throw new Error(e)
  }
}

const removeTeamMember = async (teamId, userId, options = {}) => {
  try {
    const { trx } = options
    // notify
    return useTransaction(
      async tr => {
        logger.info(
          `${TEAM_CONTROLLER} removeTeamMember: removing user with id ${userId} from team with id ${teamId}`,
        )
        return Team.addMember(teamId, userId, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} removeTeamMember: ${e.message}`)
    throw new Error(e)
  }
}

const updateTeamMembership = async (teamId, members, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${TEAM_CONTROLLER} updateTeamMembership: updating members of team with id ${teamId}`,
        )
        return Team.updateMembershipByTeamId(teamId, members, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} updateTeamMembership: ${e.message}`)
    throw new Error(e)
  }
}

// const deleteTeam = async (id, options = {}) => {
//   try {
//     const { trx } = options
//     return useTransaction(
//       async tr => {
//         logger.info(
//           `${TEAM_CONTROLLER} deleteTeam: removing team with id ${id}`,
//         )
//         return Team.deleteById(id, { trx: tr })
//       },
//       { trx, passedTrxOnly: true },
//     )
//   } catch (e) {
//     logger.error(`${TEAM_CONTROLLER} deleteTeam: ${e.message}`)
//     throw new Error(e)
//   }
// }

module.exports = {
  getTeam,
  getTeams,
  getGlobalTeams,
  getObjectTeams,
  updateTeamMembership,
  addTeamMember,
  removeTeamMember,
  //   deleteTeam,
}
