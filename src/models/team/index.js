const model = require('./team.model')
const gqlLoader = require('../graphqlLoaderUtil')
const teamResolvers = require('./team.resolvers')

module.exports = {
  model,
  modelName: 'Team',
  typeDefs: gqlLoader('./team.graphql'),
  resolvers: teamResolvers,
}
