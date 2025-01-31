const fs = require('fs')
const path = require('path')
const model = require('./user.model')
const { usersBasedOnTeamMemberIdsLoader } = require('./user.loaders')
const userResolvers = require('./user.resolvers')

module.exports = {
  model,
  modelName: 'User',
  modelLoaders: {
    usersBasedOnTeamMemberIdsLoader,
  },
  typeDefs: fs.readFileSync(path.join(__dirname, 'user.graphql'), 'utf-8'),
  resolvers: userResolvers,
}
