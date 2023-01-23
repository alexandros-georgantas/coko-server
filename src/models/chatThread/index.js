const fs = require('fs')
const path = require('path')
const model = require('./chatThread.model')
const chatThreadResolvers = require('./chatThread.resolvers')

module.exports = {
  model,
  modelName: 'ChatThread',
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'chatThread.graphql'),
    'utf-8',
  ),
  resolvers: chatThreadResolvers,
}
