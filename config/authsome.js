const get = require('lodash/get')
const isEqual = require('lodash/isEqual')

const isFromServer = operation =>
  ['create', 'read', 'update', 'delete'].includes(operation)

// Helper functions
const getUser = async (userId, operation, context) => {
  const id = getId(userId)
  const fromServer = isFromServer(operation)
  let user

  if (fromServer) {
    user = await context.models.User.find(id, {
      eager: 'teams.members.[user]',
    })
  } else {
    user = await context.models.User.find(id)
  }

  return user
}

const getId = objectOrString => {
  // In the browser client, ids are sometimes in an object, this is a way
  // to address that difference

  if (typeof objectOrString === 'string') {
    return objectOrString
  }

  return objectOrString.id
}

const isGlobalTeamMember = async (user, roles, context) => {
  const teams = await Promise.all(
    user.teams.map(teamId => context.models.Team.find(getId(teamId))),
  )

  const rolesArray = Array.isArray(roles) ? roles : [roles]

  const team = teams.find(
    aTeam => aTeam.global && rolesArray.includes(aTeam.role),
  )

  return !!team
}

const isGlobal = (user, context) =>
  isGlobalTeamMember(user, ['editors', 'scienceOfficers'], context)

const permissions = {
  // eslint-disable-next-line consistent-return
  before: async (userId, operation, object, context) => {
    if (
      userId === undefined &&
      (operation === 'create' || operation === 'read') &&
      (object === 'User' || object.type === 'user')
    ) {
      return true // it's a signup operation
    }

    const user = await getUser(userId, operation, context)
    if (user.admin) return true
  },

  create: (userId, operation, object, context) => true,

  read: async (userId, operation, object, context) => {
    // Everyone can read Teams
    if (object === 'Team') {
      return true
    }

    if (object && object.type === 'team') {
      return true
    }

    // Everyone can read Users
    if (object === 'User') {
      return true
    }

    if (object && object.type === 'user') {
      return true
    }

    if (object === 'TeamMember') {
      return true
    }

    // Capture team member (has no type property)
    // if (object && object.type === 'teamMember') {
    if (object && object.teamId && object.userId) {
      return true
    }

    return false
  },
  update: async (userId, operation, object, context) => {
    const user = await getUser(userId, operation, context)
    if (!user) return false

    if (
      (object === 'User' || get(object, 'current.type') === 'user') &&
      userId === user.id
    )
      return true

    if (object === 'Team') return true

    if (get(object, 'current.type') === 'team') {
      const { update } = object
      const changed = Object.keys(update)
      const role = get(object, 'current.role')

      // No one can update something other than members on existing teams
      if (!isEqual(changed, ['members'])) return false

      // Only global users can update the editor team members for an object
      const global = isGlobal(user, context)
      if (role === 'editor') return global

      return true
    }

    return false
  },
}

module.exports = permissions
