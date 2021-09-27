const model = require('./teamMember.model')
const gqlLoader = require('../graphqlLoaderUtil')
const teamMemberResolvers = require('./teamMember.resolvers')

const { teamMembersBasedOnTeamIdsLoader } = require('./teamMember.loaders')

module.exports = {
  model,
  modelName: 'TeamMember',
  modelLoaders: {
    teamMembersBasedOnTeamIdsLoader,
  },
  typeDefs: gqlLoader('./teamMember.graphql'),
  resolvers: teamMemberResolvers,
}
