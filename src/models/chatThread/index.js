const fs = require('fs')
const model = require('./chatThread.model')
const chatThreadResolvers = require('./chatThread.resolvers')

module.exports = {
  model,
  modelName: 'ChatThread',
  typeDefs: fs.readFileSync(`${__dirname}/chatThread.graphql`, 'utf-8'),
  resolvers: chatThreadResolvers,
}
