const fs = require('fs')
const path = require('path')
const model = require('./identity.model')

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
  typeDefs: fs.readFileSync(path.join(__dirname, 'identity.graphql'), 'utf-8'),
}
