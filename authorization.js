const {
  rule,
  inputRule,
  allow,
  deny,
  and,
  chain,
  or,
  not,
} = require('graphql-shield')

const { isAdmin, isAuthenticated } = require('./src/helpers')

module.exports = {
  rule,
  inputRule,
  allow,
  deny,
  and,
  chain,
  or,
  not,
  isAuthenticated,
  isAdmin,
}
