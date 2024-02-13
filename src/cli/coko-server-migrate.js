#!/usr/bin/env node

const program = require('commander')

const migrate = require('../dbManager/migrate')

const commandArguments = process.argv
const options = program.parse(commandArguments)

migrate(options)
  .then(() => {
    process.exit(0)
  })
  .catch(e => {
    process.exit(1)
  })
