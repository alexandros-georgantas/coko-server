const { commitizen } = require('@coko/lint')

commitizen.scopes = ['server', 'middleware', '*']

module.exports = commitizen
