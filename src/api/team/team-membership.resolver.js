const logger = require('@pubsweet/logger')
const { useTransaction } = require('../../index')

const resolvers = {
  Query: {
    async getGlobalTeams(_, __, ___) {
      // eslint-disable-next-line global-require
      const { Team } = require('@pubsweet/models')

      try {
        return Team.findAllGlobalTeams()
      } catch (e) {
        logger.error('Team resolver: Get global teams: Query failed!')
        throw new Error(e)
      }
    },
  },

  Mutation: {
    async updateGlobalTeamMembership(_, { input }, ctx) {
      // eslint-disable-next-line global-require
      const { Team } = require('@pubsweet/models')

      const { teams: inputTeams } = input

      try {
        await useTransaction(async trx =>
          Promise.all(
            inputTeams.map(team =>
              Team.updateMembershipByTeamId(team.teamId, team.members, { trx }),
            ),
          ),
        )
        return true
      } catch (e) {
        logger.error('Team resolver: Update global team membership: Failed!')
        throw new Error(e)
      }
    },
  },
}

module.exports = { resolvers }
