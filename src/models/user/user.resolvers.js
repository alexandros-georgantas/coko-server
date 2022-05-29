const { logger } = require('../../index')

const {
  labels: { USER_RESOLVER },
} = require('./constants')

const {
  getUser,
  getUsers,
  activateUser,
  activateUsers,
  deleteUser,
  deleteUsers,
  deactivateUser,
  deactivateUsers,
  updateUser,
  login,
  signUp,
  setDefaultIdentity,
  verifyEmail,
  resendVerificationEmail,
  resendVerificationEmailFromLogin,
  resendVerificationEmailAfterLogin,
  updatePassword,
  sendPasswordResetEmail,
  resetPassword,
  getDisplayName,
} = require('./user.controller')

const userResolver = async (_, { id }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} user`)
    return getUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} user: ${e.message}`)
    throw new Error(e)
  }
}

const usersResolver = async (_, args, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} users`)
    return getUsers()
  } catch (e) {
    logger.error(`${USER_RESOLVER} users: ${e.message}`)
    throw new Error(e)
  }
}

const currentUserResolver = async (_, __, ctx) => {
  try {
    const { user: userId } = ctx
    logger.error(`${USER_RESOLVER} currentUser`)
    if (!userId) return null
    return getUser(userId)
  } catch (e) {
    logger.error(`${USER_RESOLVER} currentUser: ${e.message}`)
    throw new Error(e)
  }
}

const activateUserResolver = async (_, { id }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} activateUser`)
    return activateUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} activateUser: ${e.message}`)
    throw new Error(e)
  }
}

const activateUsersResolver = async (_, { ids }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} activateUsers`)
    return activateUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} activateUsers: ${e.message}`)
    throw new Error(e)
  }
}

const deleteUserResolver = async (_, { id }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} deleteUser`)
    return deleteUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deleteUser: ${e.message}`)
    throw new Error(e)
  }
}

const deleteUsersResolver = async (_, { ids }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} deleteUsers`)
    return deleteUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deleteUsers: ${e.message}`)
    throw new Error(e)
  }
}

const deactivateUserResolver = async (_, { id }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} deactivateUser`)
    return deactivateUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deactivateUser: ${e.message}`)
    throw new Error(e)
  }
}

const deactivateUsersResolver = async (_, { ids }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} deactivateUsers`)
    return deactivateUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deactivateUsers: ${e.message}`)
    throw new Error(e)
  }
}

const updateUserResolver = async (_, { id, input }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} updateUser`)
    return updateUser(id, input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} updateUser: ${e.message}`)
    throw new Error(e)
  }
}

const loginResolver = async (_, { input }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} login`)
    return login(input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} login: ${e.message}`)
    throw new Error(e)
  }
}

const signUpResolver = async (_, { input }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} signUp`)
    return signUp(input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} signUp: ${e.message}`)
    throw new Error(e)
  }
}

const setDefaultIdentityResolver = async (_, { userId, identityId }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} setDefaultIdentity`)
    return setDefaultIdentity(userId, identityId)
  } catch (e) {
    logger.error(`${USER_RESOLVER} setDefaultIdentity: ${e.message}`)
    throw new Error(e)
  }
}

const verifyEmailResolver = async (_, { token }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} verifyEmail`)
    return verifyEmail(token)
  } catch (e) {
    logger.error(`${USER_RESOLVER} verifyEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resendVerificationEmailResolver = async (_, { token }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} resendVerificationEmail`)
    return resendVerificationEmail(token)
  } catch (e) {
    logger.error(`${USER_RESOLVER} resendVerificationEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resendVerificationEmailFromLoginResolver = async (
  _,
  { username, password },
  ctx,
) => {
  try {
    logger.error(`${USER_RESOLVER} resendVerificationEmailFromLogin`)
    return resendVerificationEmailFromLogin(username, password)
  } catch (e) {
    logger.error(
      `${USER_RESOLVER} resendVerificationEmailFromLogin: ${e.message}`,
    )
    throw new Error(e)
  }
}

const resendVerificationEmailAfterLoginResolver = async (_, __, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} resendVerificationEmailAfterLogin`)
    return resendVerificationEmailAfterLogin(ctx.user)
  } catch (e) {
    logger.error(
      `${USER_RESOLVER} resendVerificationEmailAfterLogin: ${e.message}`,
    )
    throw new Error(e)
  }
}

const updatePasswordResolver = async (_, { input }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} updatePassword`)
    return updatePassword(input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} updatePassword: ${e.message}`)
    throw new Error(e)
  }
}

const sendPasswordResetEmailResolver = async (_, { email }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} sendPasswordResetEmail`)
    return sendPasswordResetEmail(email)
  } catch (e) {
    logger.error(`${USER_RESOLVER} sendPasswordResetEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resetPasswordResolver = async (_, { token, password }, ctx) => {
  try {
    logger.error(`${USER_RESOLVER} resetPassword`)
    return resetPassword(token, password)
  } catch (e) {
    logger.error(`${USER_RESOLVER} resetPassword: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    user: userResolver,
    users: usersResolver,
    currentUser: currentUserResolver,
  },
  Mutation: {
    activateUser: activateUserResolver,
    activateUsers: activateUsersResolver,
    deleteUser: deleteUserResolver,
    deleteUsers: deleteUsersResolver,
    deactivateUser: deactivateUserResolver,
    deactivateUsers: deactivateUsersResolver,
    updateUser: updateUserResolver,
    login: loginResolver,
    signUp: signUpResolver,
    setDefaultIdentity: setDefaultIdentityResolver,
    verifyEmail: verifyEmailResolver,
    resendVerificationEmail: resendVerificationEmailResolver,
    resendVerificationEmailFromLogin: resendVerificationEmailFromLoginResolver,
    resendVerificationEmailAfterLogin: resendVerificationEmailAfterLoginResolver,
    updatePassword: updatePasswordResolver,
    sendPasswordResetEmail: sendPasswordResetEmailResolver,
    resetPassword: resetPasswordResolver,
  },
  User: {
    async identities(user, _, ctx) {
      const { id } = user
      return ctx.loaders.Identity.identitiesBasedOnUserIdsLoader.load(id)
    },
    async defaultIdentity(user, _, ctx) {
      const { id } = user
      return ctx.loaders.Identity.defaultIdentityBasedOnUserIdsLoader.load(id)
    },
    // async teams(user, _, ctx) {
    //   // TODO loader
    // },
    displayName(user, _, ctx) {
      return getDisplayName(user)
    },
  },
}
