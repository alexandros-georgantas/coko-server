module.exports = {
  clientUrl: 'CLIENT_URL',
  host: 'SERVER_HOST',
  port: 'SERVER_PORT',
  protocol: 'SERVER_PROTOCOL',
  secret: 'SECRET',
  db: {
    user: 'POSTGRES_USER',
    password: 'POSTGRES_PASSWORD',
    host: 'POSTGRES_HOST',
    database: 'POSTGRES_DB',
    port: 'POSTGRES_PORT',
  },
  serverUrl: 'SERVER_URL',
  fileStorage: {
    accessKeyId: 'S3_ACCESS_KEY_ID',
    secretAccessKey: 'S3_SECRET_ACCESS_KEY',
    bucket: 'S3_BUCKET',
    region: 'S3_REGION',
    protocol: 'S3_PROTOCOL',
    host: 'S3_HOST',
    port: 'S3_PORT',
    minioConsolePort: 'MINIO_CONSOLE_PORT',
    maximumWidthForSmallImages: 'MAXIMUM_WIDTH_FOR_SMALL_IMAGES',
    maximumWidthForMediumImages: 'MAXIMUM_WIDTH_FOR_MEDIUM_IMAGES',
  },
  passwordReset: {
    path: 'PASSWORD_RESET_PATH',
  },
  mailer: {
    from: 'MAILER_SENDER',
    transport: {
      host: 'MAILER_HOSTNAME',
      port: 'MAILER_PORT',
      auth: {
        user: 'MAILER_USER',
        pass: 'MAILER_PASSWORD',
      },
    },
  },
}
