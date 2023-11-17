const fs = require('fs')
const path = require('path')
const model = require('./identity.model')
const identityResolvers = require('./identity.resolvers')

const {
  identitiesBasedOnUserIdsLoader,
  defaultIdentityBasedOnUserIdsLoader,
} = require('./identity.loaders')

module.exports = {
  model,
  modelName: 'Identity',
  modelLoaders: {
    identitiesBasedOnUserIdsLoader,
    defaultIdentityBasedOnUserIdsLoader,
  },
  resolvers: identityResolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'identity.graphql'), 'utf-8'),
}
