const {
  rule,
  inputRule,
  allow,
  deny,
  and,
  chain,
  or,
  not,
} = require('graphql-shield')

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return !!ctx.user
})

const isAdmin = rule()(
  async (parent, args, { user: userId, connectors: { User } }, info) => {
    if (!userId) {
      return false
    }

    const user = await User.model.findById(userId)
    return user.admin
  },
)

module.exports = {
  rule,
  inputRule,
  allow,
  deny,
  and,
  chain,
  or,
  not,
  isAuthenticated,
  isAdmin,
}
