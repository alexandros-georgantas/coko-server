module.exports = {
  'pubsweet-server': {
    db: {
      host: 'POSTGRES_HOST',
      port: 'POSTGRES_PORT',
      database: 'POSTGRES_DB',
      user: 'POSTGRES_USER',
      password: 'POSTGRES_PASSWORD',
    },
    tempFolderPath: 'TEMP_FOLDER_PATH',
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
  chatGPT: {
    key: 'CHAT_GPT_KEY',
  },
}
