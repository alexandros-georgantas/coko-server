module.exports = {
  TeamMember: {
    async user(teamMember, _, ctx) {
      const { userId } = teamMember
      return ctx.loaders.User.usersBasedOnTeamMemberIdsLoader.load(userId)
    },
  },
}
