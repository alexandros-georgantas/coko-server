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
    port: 3000,
    protocol: 'http',
    host: 'localhost',
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
    useWebSockets: true,
    useGraphQLServer: false,
    websocketPaths: 'test1, test2',
    useJobQueue: false,
  },
  authsome: {
    mode: path.join(__dirname, 'authsome.js'),
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
