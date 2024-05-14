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
      editor: {
        displayName: 'Editor',
        role: 'editor',
      },
      author: {
        displayName: 'Author',
        role: 'author',
      },
    },
    nonGlobal: {
      editor: {
        displayName: 'Editor',
        role: 'editor',
      },
      author: {
        displayName: 'Author',
        role: 'author',
      },
      reviewer: {
        displayName: 'Reviewer',
        role: 'reviewer',
      },
    },
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
      redirectUri:
        'http://localhost:4000/provider-connection-popup/lulu?next=/',
      tokenUrl:
        'https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token',
    },
  },
  mailer: {
    from: '',
  },
}
