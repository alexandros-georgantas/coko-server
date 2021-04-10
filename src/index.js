const cron = require('node-cron')

const BaseModel = require('@pubsweet/base-model')
const authentication = require('pubsweet-server/src/authentication')
const { pubsubManager, startServer } = require('pubsweet-server')
const logger = require('@pubsweet/logger')
const { db } = require('@pubsweet/db-manager')
const { send: sendEmail } = require('@pubsweet/component-send-email')

const app = require('./app')
const { boss, connectToJobQueue } = require('./pgboss')
const useTransaction = require('./useTransaction')

const createJWT = authentication.token.create

module.exports = {
  app,
  createJWT,
  pubsubManager,
  startServer,

  sendEmail,

  BaseModel,
  logger,
  db,
  useTransaction,

  cron,

  boss,
  connectToJobQueue,
}
