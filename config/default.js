const path = require('path')
const components = require('./components')

module.exports = {
  pubsweet: { components },
  'pubsweet-server': {
    app: path.resolve(__dirname, '..', 'src', 'app.js'),
    useGraphQLServer: false,
    db: {
      host: 'localhost',
      port: '5432',
      database: 'cokoserver',
      user: 'postgres',
      password: 'postgres',
    },
    secret: 'somesecret123',
  },
  authsome: {
    mode: path.join(__dirname, 'authsome.js'),
    // teams: {
    //   author: {
    //     name: 'Author',
    //   },
    //   editor: {
    //     name: 'Editor',
    //   },
    //   editors: {
    //     name: 'Editors Global',
    //   },
    // },
  },
  fileStorage: {
    minioRootUser: 'MINIO_ROOT_USER',
    minioRootPassword: 'MINIO_ROOT_PASSWORD',
    accessKeyId: 'S3_ACCESS_KEY_ID',
    secretAccessKey: 'S3_SECRET_ACCESS_KEY',
    bucket: 'S3_BUCKET',
    protocol: 'S3_PROTOCOL',
    host: 'S3_HOST',
    port: 'S3_PORT',
    minioConsolePort: 'MINIO_CONSOLE_PORT',
    maximumWidthForSmallImages: 'MAXIMUM_WIDTH_FOR_SMALL_IMAGES',
    maximumWidthForMediumImages: 'MAXIMUM_WIDTH_FOR_MEDIUM_IMAGES',
  },
}
