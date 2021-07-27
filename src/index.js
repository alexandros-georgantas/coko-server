const cron = require('node-cron')
const { v4: uuid } = require('uuid')

const authentication = require('pubsweet-server/src/authentication')
const { pubsubManager, startServer } = require('pubsweet-server')
const logger = require('@pubsweet/logger')
const { db } = require('@pubsweet/db-manager')
const { send: sendEmail } = require('@pubsweet/component-send-email')

const app = require('./app')
const { boss, connectToJobQueue } = require('./pgboss')
const { BaseModel, useTransaction } = require('./models')

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
  uuid,

  boss,
  connectToJobQueue,
}
