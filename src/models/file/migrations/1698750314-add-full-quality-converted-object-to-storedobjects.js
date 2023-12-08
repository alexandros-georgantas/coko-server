/* eslint-disable import/no-unresolved */
const logger = require('@pubsweet/logger')
const mime = require('mime-types')
const fs = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const { useTransaction } = require('@coko/server')

const File = require('@coko/server/src/models/file/file.model')

const {
  connectToFileStorage,
  download,
  uploadFileHandler,
} = require('@coko/server/src/services/fileStorage')

const {
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
} = require('@coko/server/src/helpers')

const imageSizeConversionMapper = {
  tiff: {
    full: 'png',
  },
  tif: {
    full: 'png',
  },
  svg: {
    full: 'svg',
  },
  png: {
    full: 'png',
  },
  default: {
    full: 'jpeg',
  },
}

const sharpConversionFullFilePath = async (
  buffer,
  tempDir,
  filenameWithoutExtension,
  format,
) => {
  await fs.ensureDir(tempDir)

  const tempFullFilePath = path.join(
    tempDir,
    `${filenameWithoutExtension}_full.${
      imageSizeConversionMapper[format]
        ? imageSizeConversionMapper[format].full
        : imageSizeConversionMapper.default.full
    }`,
  )

  await sharp(buffer).toFile(tempFullFilePath)

  return tempFullFilePath
}

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      await connectToFileStorage()
      const files = await File.query(trx)

      const tempDir = path.join(__dirname, '..', 'temp')
      await fs.ensureDir(tempDir)

      await Promise.all(
        files.map(async file => {
          const mimetype = mime.lookup(file.name)

          if (mimetype.match(/^image\//)) {
            const originalStoredObject = file.storedObjects.find(
              storedObject => storedObject.type === 'original',
            )

            const filenameWithoutExtension = path.parse(
              originalStoredObject.key,
            ).name

            const tempPath = path.join(tempDir, originalStoredObject.key)
            await download(originalStoredObject.key, tempPath)

            const format = originalStoredObject.extension

            const buffer = fs.readFileSync(tempPath)

            const tempFullFilePath = await sharpConversionFullFilePath(
              buffer,
              tempDir,
              filenameWithoutExtension,
              format,
            )

            fs.unlinkSync(tempPath)

            const fullImageStream = fs.createReadStream(tempFullFilePath)

            const full = await uploadFileHandler(
              fs.createReadStream(tempFullFilePath),
              path.basename(tempFullFilePath),
              mime.lookup(tempFullFilePath),
            )

            const fullFileBuffer = await convertFileStreamIntoBuffer(
              fullImageStream,
            )

            const {
              width: fWidth,
              height: fHeight,
              space: fSpace,
              density: fDensity,
              size: fSize,
            } = await getImageFileMetadata(fullFileBuffer)

            full.imageMetadata = {
              density: fDensity,
              height: fHeight,
              space: fSpace,
              width: fWidth,
            }
            full.size = fSize
            full.extension = `${getFileExtension(tempFullFilePath)}`
            full.type = 'full'
            full.mimetype = mime.lookup(tempFullFilePath)

            file.storedObjects.push(full)

            await File.query(trx).patchAndFetchById(file.id, {
              storedObjects: file.storedObjects,
            })

            fs.unlinkSync(tempFullFilePath)
          }
        }),
      )

      return true
    })
  } catch (e) {
    logger.error(
      'File: Add full conversion image quality to stored objects migration failed!',
    )
    throw new Error(e)
  }
}
