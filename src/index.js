const cron = require('node-cron')

const BaseModel = require('@pubsweet/base-model')
const authentication = require('pubsweet-server/src/authentication')
const { pubsubManager, startServer } = require('pubsweet-server')
const logger = require('@pubsweet/logger')

const app = require('./app')
const { boss, connectToJobQueue } = require('./pgboss')

const createJWT = authentication.token.create

module.exports = {
  app,
  createJWT,
  logger,
  pubsubManager,
  startServer,
  BaseModel,

  cron,

  boss,
  connectToJobQueue,
}
