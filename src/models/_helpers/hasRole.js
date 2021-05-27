const { TeamMember } = require('@pubsweet/models')

const hasRole = async (userId, objectId, role, global = false) => {
  const member = await TeamMember.query()
    .leftJoin('teams', 'teams.id', 'team_members.team_id')
    .findOne({
      global,
      role,
      objectId,
      userId,
    })

  return !!member
}

module.exports = hasRole
