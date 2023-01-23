const fs = require('fs')
const path = require('path')
const model = require('./team.model')
const teamResolvers = require('./team.resolvers')

module.exports = {
  model,
  modelName: 'Team',
  typeDefs: fs.readFileSync(path.join(__dirname, 'team.graphql'), 'utf-8'),
  resolvers: teamResolvers,
}
