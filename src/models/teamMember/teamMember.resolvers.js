const User = require('../user/user.model')

const usersResolver = async teamMember => {
  const { userId } = teamMember
  return User.findById(userId)
}

module.exports = {
  TeamMember: {
    user: usersResolver,
  },
}
