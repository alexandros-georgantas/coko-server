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
  'file-server': {
    rootUser: 'FILE_SERVER_ROOT_USER',
    rootUserPassword: 'FILE_SERVER_ROOT_USER_PASSWORD',
    bucket: 'S3_BUCKET',
    protocol: 'S3_PROTOCOL',
    host: 'S3_HOST',
    port: 'S3_PORT',
    consolePort: 'S3_CONSOLE_PORT',
    maximumWidthForSmallImages: 'MAXIMUM_WIDTH_FOR_SMALL_IMAGES',
    maximumWidthForMediumImages: 'MAXIMUM_WIDTH_FOR_MEDIUM_IMAGES',
  },
}
