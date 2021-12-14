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
  services: {
    pagedjs: {
      clientId: 'SERVICE_PAGEDJS_CLIENT_ID',
      clientSecret: 'SERVICE_PAGEDJS_SECRET',
      protocol: 'SERVICE_PAGEDJS_PROTOCOL',
      host: 'SERVICE_PAGEDJS_HOST',
      port: 'SERVICE_PAGEDJS_PORT',
    },
    xsweet: {
      clientId: 'SERVICE_XSWEET_CLIENT_ID',
      clientSecret: 'SERVICE_XSWEET_SECRET',
      protocol: 'SERVICE_XSWEET_PROTOCOL',
      host: 'SERVICE_XSWEET_HOST',
      port: 'SERVICE_XSWEET_PORT',
    },
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
