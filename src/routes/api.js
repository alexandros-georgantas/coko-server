const express = require('express')
const helmet = require('helmet')

const api = express.Router({ mergeParams: true })

api.use(helmet())

// File upload API
const upload = require('./apiUpload')

api.use(upload)

module.exports = api
