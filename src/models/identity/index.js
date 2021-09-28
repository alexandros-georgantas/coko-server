const fs = require('fs')
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
  typeDefs: fs.readFileSync(`${__dirname}/identity.graphql`, 'utf-8'),
}
