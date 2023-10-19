/**
 * Only used by jest, not part of the distributed package
 */

const path = require('path')

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
    useFileStorage: true,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
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
  fileStorage: {
    accessKeyId: 'cokoServerUser',
    secretAccessKey: 'superSecretUserPassword',
    bucket: 'uploads',
    protocol: 'http',
    host: 'localhost',
    port: '9000',
    minioConsolePort: '9001',
  },
}
