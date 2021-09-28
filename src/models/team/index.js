const fs = require('fs')
const model = require('./team.model')
const teamResolvers = require('./team.resolvers')

module.exports = {
  model,
  modelName: 'Team',
  typeDefs: fs.readFileSync(`${__dirname}/team.graphql`, 'utf-8'),
  resolvers: teamResolvers,
}
