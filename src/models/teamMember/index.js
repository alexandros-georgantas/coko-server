const model = require('./teamMember.model')

const { teamMembersBasedOnTeamIdsLoader } = require('./teamMember.loaders')

module.exports = {
  model,
  modelName: 'TeamMember',
  modelLoaders: {
    teamMembersBasedOnTeamIdsLoader,
  },
}
