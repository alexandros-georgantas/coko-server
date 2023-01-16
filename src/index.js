const cron = require('node-cron')
const { v4: uuid } = require('uuid')

const authentication = require('pubsweet-server/src/authentication')
const { pubsubManager } = require('pubsweet-server')
const logger = require('@pubsweet/logger')
const { db } = require('@pubsweet/db-manager')
const { send: sendEmail } = require('@pubsweet/component-send-email')

const { File } = require('./models')
const { createFile, deleteFiles } = require('./models/file/file.controller')

const app = require('./app')
const startServer = require('./startServer')
const { boss, connectToJobQueue } = require('./pgboss')
const { BaseModel, useTransaction } = require('./models')
const modelTypes = require('./models/_helpers/types')

const {
  healthCheck,
  getURL,
  upload,
  deleteFiles: fileStorageDeleteFiles,
  list,
  download,
} = require('./services/fileStorage')

// Do not expose connectToFileStorage
const fileStorage = {
  healthCheck,
  getURL,
  upload,
  deleteFiles: fileStorageDeleteFiles,
  list,
  download,
}

// const { serviceHandshake } = require('./helpers')

const createJWT = authentication.token.create
const verifyJWT = authentication.token.verify

module.exports = {
  app,
  createJWT,
  verifyJWT,
  pubsubManager,
  startServer,
  modelTypes,
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
