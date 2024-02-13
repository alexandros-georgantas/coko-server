#!/usr/bin/env node

/* eslint-disable no-underscore-dangle */

const program = require('commander')
const pkg = require('../../package.json')

program
  .version(pkg.version)
  .command('migrate', 'run pending database migrations')
  .parse(process.argv)

if (!program.commands.map(cmd => cmd._name).includes(program.args[0])) {
  program.help()
}
