const cron = require('node-cron')

const BaseModel = require('@pubsweet/base-model')
const authentication = require('pubsweet-server/src/authentication')
const { startServer } = require('pubsweet-server')
const logger = require('@pubsweet/logger')

const app = require('./app')

const createJWT = authentication.token.create

module.exports = {
  app,
  cron,
  createJWT,
  logger,
  startServer,
  BaseModel,
}
