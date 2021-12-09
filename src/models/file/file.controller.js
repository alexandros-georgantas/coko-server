const { File } = require('../index')
const { logger, useTransaction } = require('../../index')
const { deleteRemoteFiles } = require('../../services/objectStorage')

const {
  labels: { FILE_CONTROLLER },
} = require('./constants')

const deleteFiles = async (ids, removeFromFileServer = false, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${FILE_CONTROLLER} deleteFiles: deleting files with ids ${ids}`,
    )
    return useTransaction(
      async tr => {
        if (removeFromFileServer) {
          logger.info(
            `${FILE_CONTROLLER} deleteFiles: flag removeFromFileServer is enabled and will trigger permanent deletion of files in file server too`,
          )
          const toBeDeletedFiles = await File.findByIds(ids, { trx: tr })
          await Promise.all(
            toBeDeletedFiles.map(async deletedFile => {
              const { storedObjects } = deletedFile
              const keys = []
              storedObjects.forEach(storedObject => keys.push(storedObject.key))

              await deleteRemoteFiles(keys)
            }),
          )
        }

        return File.deleteByIds(ids, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} deleteFiles: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  deleteFiles,
}
