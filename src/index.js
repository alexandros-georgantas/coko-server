const cron = require('node-cron')
const { v4: uuid } = require('uuid')

const BaseModel = require('@pubsweet/base-model')
const authentication = require('pubsweet-server/src/authentication')
const { pubsubManager, startServer } = require('pubsweet-server')
const logger = require('@pubsweet/logger')
const { db } = require('@pubsweet/db-manager')
const { send: sendEmail } = require('@pubsweet/component-send-email')

const { File } = require('./models')
const { createFile, deleteFiles } = require('./models/file/file.controller')

const app = require('./app')
const { boss, connectToJobQueue } = require('./pgboss')
const useTransaction = require('./useTransaction')
const fileStorage = require('./services/fileStorage')
// const { serviceHandshake } = require('./helpers')

const createJWT = authentication.token.create
module.exports = {
  app,
  createJWT,
  pubsubManager,
  startServer,
  fileStorage,
  createFile,
  deleteFiles,
  // serviceHandshake,
  sendEmail,

  BaseModel,
  File,
  logger,
  db,
  useTransaction,

  cron,
  uuid,

  boss,
  connectToJobQueue,
}
