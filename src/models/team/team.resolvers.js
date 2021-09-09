const {
  getTeam,
  getTeams,
  getGlobalTeams,
  getObjectTeams,
  updateTeamMembership,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
} = require('./team.controller')

module.exports = {
  Query: {
    team: getTeam,
    teams: getTeams,
    getGlobalTeams,
    getObjectTeams,
  },
  Mutation: {
    updateTeamMembership,
    addTeamMember,
    removeTeamMember,
    deleteTeam,
  },
  Team: {
    async members(team, _, ctx) {
      const { id } = team
      return ctx.loaders.TeamMember.teamMembersBasedOnTeamIdsLoader.load(id)
    },
  },
}
