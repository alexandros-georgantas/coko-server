/**
 * Only used by jest, not part of the distributed package
 */
const { deferConfig } = require('config/defer')
const path = require('path')

const components = require('./components')

module.exports = {
  'pubsweet-server': {
    baseUrl: deferConfig(cfg => {
      const { protocol, host, port } = cfg['pubsweet-server']
      return `${protocol}://${host}${port ? `:${port}` : ''}`
    }),
    db: {
      host: 'localhost',
      port: '5432',
      database: 'test_db',
      user: 'test_user',
      password: 'password',
    },
    emailVerificationTokenExpiry: {
      amount: 24,
      unit: 'hours',
    },
    secret: 'whatASecret',
    passwordResetTokenExpiry: {
      amount: 24,
      unit: 'hours',
    },
    tempFolderPath: path.join(process.cwd(), 'temp'),
  },
  pubsweet: {
    components,
  },
  teams: {
    global: {
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
    },
  },
  'file-server': {
    rootUser: 'admin',
    rootUserPassword: 'superSecretAdminPassword',
    bucket: 'uploads',
    protocol: 'http',
    host: 'localhost',
    port: '9000',
    consolePort: '9001',
  },
  services: {},
}
