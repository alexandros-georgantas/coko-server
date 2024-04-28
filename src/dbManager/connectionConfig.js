const config = require('config')

const { isEnvVariableTrue } = require('../utils/env')

const connection =
  process.env.DATABASE_URL ||
  (config['pubsweet-server'] && config['pubsweet-server'].db)

if (isEnvVariableTrue(process.env.POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES)) {
  if (!connection.ssl) connection.ssl = {}
  connection.ssl.rejectUnauthorized = false
}

module.exports = connection
