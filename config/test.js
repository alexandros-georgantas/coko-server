/**
 * Only used by jest, not part of the distributed package
 */

const components = require('./components')

module.exports = {
  'pubsweet-server': {
    db: {
      host: 'localhost',
      port: '5432',
      database: 'test_db',
      user: 'test_user',
      password: 'password',
    },
  },
  dbManager: {
    migrationsPath: './src/models/migrations',
  },
  pubsweet: {
    components,
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
