const model = require('./user.model')
const { usersBasedOnTeamMemberIdsLoader } = require('./user.loaders')

module.exports = {
  model,
  modelName: 'User',
  modelLoaders: {
    usersBasedOnTeamMemberIdsLoader,
  },
}
