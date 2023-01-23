const fs = require('fs')
const path = require('path')
const model = require('./teamMember.model')
const teamMemberResolvers = require('./teamMember.resolvers')

const { teamMembersBasedOnTeamIdsLoader } = require('./teamMember.loaders')

module.exports = {
  model,
  modelName: 'TeamMember',
  modelLoaders: {
    teamMembersBasedOnTeamIdsLoader,
  },
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'teamMember.graphql'),
    'utf-8',
  ),
  resolvers: teamMemberResolvers,
}
