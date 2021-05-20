const { commitizen } = require('@coko/lint')

commitizen.scopes = ['server', 'middleware', 'models', '*']

module.exports = commitizen
