const cron = require('node-cron')

const authentication = require('pubsweet-server/src/authentication')

const app = require('./app')

const createJWT = authentication.token.create

module.exports = {
  app,
  cron,
  createJWT,
}
