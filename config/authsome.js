/* eslint-disable sort-keys */

const get = require('lodash/get')
const isEqual = require('lodash/isEqual')
const xor = require('lodash/xor')

// const logger = require('@pubsweet/logger')

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

    if (userId === undefined) return false

    const user = await getUser(userId, operation, context)
    if (user.admin) return true
  },
  create: (userId, operation, object, context) => true,
  read: async (userId, operation, object, context) => {
    const user = await getUser(userId, operation, context)

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

    if (object === 'Team') return true

    if (get(object, 'current.type') === 'team') {
      const { current, update } = object
      const role = get(object, 'current.role')
      const changed = Object.keys(update)

      // No one can update something other than members on existing teams
      if (!isEqual(changed, ['members'])) return false
      const affectedIds = xor(current.members, update.members)

      // Only global users can update the editor & SO team members for an object
      const global = isGlobal(user, context)
      if (role === 'editor' || role === 'scienceOfficer') return global

      // Only editors can update the reviewer teams
      const editor = isEditor(user, context)
      const editorAllow = ['reviewers', 'reviewersInvited']
      if (editor && editorAllow.includes(role)) return true

      // Only invited reviewers can alter accepted or rejected teams
      // They can only apply changes that affect themselves and no one else
      if (!isEqual(affectedIds, [userId])) return false

      const reviewerInvited = await isInvitedReviewer(
        user,
        { id: current.object.objectId }, // pass article as object, not team
        // { id: current.objectId }, // pass article as object, not team
        context,
        operation,
      )

      const reviewerAllow = ['reviewersAccepted', 'reviewersRejected']
      if (reviewerAllow.includes(role)) return reviewerInvited

      // DEPRECATED -- safe to remove?
      // Necessary, as any user needs to run the normalize team mutation
      return true
    }

    return false
  },
}

module.exports = permissions
