const usersResolver = async (teamMember, _, ctx) => {
  const { userId } = teamMember
  return ctx.loaders.User.usersBasedOnTeamMemberIdsLoader.load(userId)
}

module.exports = {
  TeamMember: {
    user: usersResolver,
  },
}
