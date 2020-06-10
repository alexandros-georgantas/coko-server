const cron = require('node-cron')

const authentication = require('pubsweet-server/src/authentication')
const logger = require('@pubsweet/logger')

const app = require('./app')
const { BaseModel } = require('./baseModel')

const createJWT = authentication.token.create

module.exports = {
  app,
  cron,
  createJWT,
  logger,
  BaseModel,
}
