const config = require('config')
const isEmpty = require('lodash/isEmpty')
const { applyMiddleware } = require('graphql-middleware')
const { shield } = require('graphql-shield')
let schema = require('pubsweet-server/src/graphql/schema')

const permissions = config.has('permissions') && config.get('permissions')

if (permissions && !isEmpty(permissions)) {
  schema = applyMiddleware(schema, shield(permissions))
}

module.exports = schema
