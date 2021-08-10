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
}
