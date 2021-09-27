const model = require('./identity.model')
const gqlLoader = require('../graphqlLoaderUtil')

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
  typeDefs: gqlLoader('identity/identity.graphql'),
}
