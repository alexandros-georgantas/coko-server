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
  updatePassword,
  sendPasswordResetEmail,
  resetPassword,
  getDisplayName,
} = require('./user.controller')

module.exports = {
  Query: {
    user: getUser,
    users: getUsers,
    currentUser: getUser,
  },
  Mutation: {
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
    updatePassword,
    sendPasswordResetEmail,
    resetPassword,
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
    async teams(user, _, ctx) {
      // TODO loader
    },
    displayName(user, _, ctx) {
      return getDisplayName(user)
    },
  },
}
