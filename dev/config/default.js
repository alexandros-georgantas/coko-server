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
  integrations: {
    dummy: {
      clientId: 'ketida-editor',
      redirectUri: 'http://localhost:4000/provider-connection-popup/dummy',
      tokenUrl:
        'https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token',
    },
  },
  mailer: {
    from: '',
  },
}
