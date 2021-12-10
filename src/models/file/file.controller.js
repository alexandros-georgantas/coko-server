const { File } = require('../index')
const { logger, useTransaction } = require('../../index')

const {
  deleteRemoteFiles,
  uploadFile,
} = require('../../services/objectStorage')

const {
  labels: { FILE_CONTROLLER },
} = require('./constants')

const createFile = async (
  fileStream,
  name,
  alt = null,
  description = null,
  tags = [],
  objectId = null,
  objectType = null,
  options = {},
) => {
  try {
    const { trx, forceFilenameAsObjectKey } = options
    logger.info(
      `${FILE_CONTROLLER} createFile: creating a new file representation`,
    )
    return useTransaction(
      async tr => {
        const storedObjects = await uploadFile(
          fileStream,
          name,
          forceFilenameAsObjectKey,
        )

        return File.insert(
          { name, alt, description, tags, objectId, objectType, storedObjects },
          { trx: tr },
        )
      },
      {
        trx,
        passedTrxOnly: true,
      },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} createFile: ${e.message}`)
    throw new Error(e)
  }
}

const updateFile = async (id, data, options = {}) => {
  try {
    const { trx } = options
    logger.info(`${FILE_CONTROLLER} updateFile: updating file with id ${id}`)
    return useTransaction(
      async tr => {
        return File.patchAndFetchById(id, data, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} updateFile: ${e.message}`)
    throw new Error(e)
  }
}

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
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} deleteFiles: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  createFile,
  deleteFiles,
  updateFile,
}
