const model = require('./user.model')
const gqlLoader = require('../graphqlLoaderUtil')
const { usersBasedOnTeamMemberIdsLoader } = require('./user.loaders')
const userResolvers = require('./user.resolvers')

module.exports = {
  model,
  modelName: 'User',
  modelLoaders: {
    usersBasedOnTeamMemberIdsLoader,
  },
  typeDefs: gqlLoader('user/user.graphql'),
  resolvers: userResolvers,
}
