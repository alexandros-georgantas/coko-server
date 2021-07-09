const path = require('path')
const components = require('./components')

module.exports = {
  pubsweet: { components },

  'pubsweet-server': {
    app: path.resolve(__dirname, '..', 'src', 'app.js'),
    uploads: 'uploads',
    db: {
      host: 'localhost',
      port: '5432',
      database: 'test_db',
      user: 'test_user',
      password: 'password',
    },
    secret: 'somesecret123',
  },

  authsome: {
    mode: path.join(__dirname, 'authsome.js'),

    teams: {
      author: {
        name: 'Author',
      },
      editor: {
        name: 'Editor',
      },
      editors: {
        name: 'Editors Global',
      },
    },
  },

  reviewer_statuses: {
    accepted: 'accepted',
    added: 'added',
    invited: 'invited',
    rejected: 'rejected',
    revoked: 'revoked',
  },

  teams: {
    global: {
      EDITOR: 'editor',
      AUTHOR: 'author',
    },
    nonglobal: {
      EDITOR: 'editor',
      AUTHOR: 'author',
    },
  },
}
