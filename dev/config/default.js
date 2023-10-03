const path = require('path')

const components = require('./components')

module.exports = {
  pubsweet: {
    components,
  },
  teams: {
    global: {
      admin: {
        displayName: 'Admin',
        role: 'admin',
      },
    },
    nonGlobal: {},
  },
  'pubsweet-server': {
    host: 'localhost',
  },
  authsome: {
    mode: path.join(__dirname, 'authsome.js'),
  },
}
