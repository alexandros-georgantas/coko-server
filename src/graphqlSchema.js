const config = require('config')

const { applyMiddleware } = require('graphql-middleware')
const { shield } = require('graphql-shield')
let schema = require('pubsweet-server/src/graphql/schema')

if (config.has('permissions')) {
  schema = applyMiddleware(schema, shield(config.get('permissions')))
}

module.exports = schema
