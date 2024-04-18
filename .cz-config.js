const { commitizen } = require('@coko/lint')

commitizen.scopes = ['server', 'middleware', 'models', 'db-manager', '*']

module.exports = commitizen
