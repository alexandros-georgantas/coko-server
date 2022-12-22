const path = require('path')
const sharp = require('sharp')
const fs = require('fs-extra')
const config = require('config')
const commandExists = require('command-exists').sync
const { exec } = require('child_process')
const logger = require('@pubsweet/logger')

const imageConversionToSupportedFormatMapper = {
  eps: 'svg',
}

const imageSizeConversionMapper = {
  tiff: {
    small: 'png',
    medium: 'png',
  },
  tif: {
    small: 'png',
    medium: 'png',
  },
  svg: {
    small: 'svg',
    medium: 'svg',
  },
  png: {
    small: 'png',
    medium: 'png',
  },
  default: {
    small: 'jpeg',
    medium: 'jpeg',
  },
}

const convertFileStreamIntoBuffer = async fileStream => {
  return new Promise((resolve, reject) => {
    // Store file data chunks
    const chunks = []

    // Throw if error occurred
    fileStream.on('error', err => {
      reject(err)
    })

    // File is done being read
    fileStream.on('end', () => {
      // create the final data Buffer from data chunks;
      resolve(Buffer.concat(chunks))
    })

    // Data is flushed from fileStream in chunks,
    // this callback will be executed for each chunk
    fileStream.on('data', chunk => {
      chunks.push(chunk) // push data chunk to array
    })
  })
}

const getFileExtension = (filename, includingDot = false) => {
  const { ext } = path.parse(filename)

  if (!includingDot) {
    return ext.split('.')[1]
  }

  return ext
}

const getImageFileMetadata = async fileBuffer => {
  try {
    const originalImage = sharp(fileBuffer, { limitInputPixels: false })
    const imageMetadata = await originalImage.metadata()
    return imageMetadata
  } catch (e) {
    throw new Error(e)
  }
}

const getImageWidth = async fileBuffer => {
  try {
    return getImageFileMetadata(fileBuffer).width
  } catch (e) {
    throw new Error(e)
  }
}

const writeFileFromStream = async (inputStream, filePath) => {
  try {
    return new Promise((resolve, reject) => {
      const outputStream = fs.createWriteStream(filePath)

      inputStream.pipe(outputStream)
      outputStream.on('error', error => {
        reject(error.message)
      })

      outputStream.on('finish', () => {
        resolve()
      })
    })
  } catch (e) {
    throw new Error(e)
  }
}

const handleUnsupportedImageFormats = async (filename, tempDir) => {
  try {
    const filenameWithoutExtension = path.parse(filename).name
    const tempOriginalFilePath = path.join(tempDir, filename)

    if (!commandExists('magick') && !commandExists('convert')) {
      throw new Error(
        'for .eps support you need ImageMagick installed on your OS or container',
      )
    }

    const targetFilePath = `${path.join(tempDir, filenameWithoutExtension)}.${
      imageConversionToSupportedFormatMapper[getFileExtension(filename)]
    }`

    return new Promise((resolve, reject) => {
      exec(
        `convert ${tempOriginalFilePath} ${targetFilePath}`,
        (error, stdout, stderr) => {
          if (error) {
            return reject(error)
          }

          logger.info(stdout || stderr)

          return resolve(targetFilePath)
        },
      )
    })
  } catch (e) {
    throw new Error(e)
  }
}

const createImageVersions = async (
  buffer,
  tempDirRoot,
  filenameWithoutExtension,
  originalImageWidth,
  format,
) => {
  try {
    const { maximumWidthForSmallImages, maximumWidthForMediumImages } =
      config.get('fileStorage')

    const mediumWidth = maximumWidthForMediumImages
      ? parseInt(maximumWidthForMediumImages, 10)
      : 640

    const smallWidth = maximumWidthForSmallImages
      ? parseInt(maximumWidthForSmallImages, 10)
      : 180

    const smallFilePath = path.join(
      tempDirRoot,
      `${filenameWithoutExtension}_small.${
        imageSizeConversionMapper[format]
          ? imageSizeConversionMapper[format].small
          : imageSizeConversionMapper.default.small
      }`,
    )

    const mediumFilePath = path.join(
      tempDirRoot,
      `${filenameWithoutExtension}_medium.${
        imageSizeConversionMapper[format]
          ? imageSizeConversionMapper[format].medium
          : imageSizeConversionMapper.default.medium
      }`,
    )

    // all the versions of SVG will be the same as the original file
    if (format === 'svg') {
      await sharp(buffer).toFile(smallFilePath)
      await sharp(buffer).toFile(mediumFilePath)

      return {
        tempSmallFile: smallFilePath,
        tempMediumFile: mediumFilePath,
      }
    }

    await sharp(buffer)
      .resize({
        width: smallWidth,
      })
      .toFile(smallFilePath)

    if (originalImageWidth < mediumWidth) {
      await sharp(buffer).toFile(mediumFilePath)
    } else {
      await sharp(buffer).resize({ width: mediumWidth }).toFile(mediumFilePath)
    }

    return {
      tempSmallFile: smallFilePath,
      tempMediumFile: mediumFilePath,
    }
  } catch (e) {
    throw new Error(e)
  }
}

const handleImageVersionsCreation = async (
  filename,
  tempDir,
  unsupportedFile = false,
) => {
  try {
    const filenameWithoutExtension = path.parse(filename).name

    const fileEXT = unsupportedFile
      ? imageConversionToSupportedFormatMapper[getFileExtension(filename)]
      : getFileExtension(filename)

    const filePath = path.join(
      tempDir,
      `${filenameWithoutExtension}.${fileEXT}`,
    )

    const fileBuffer = await convertFileStreamIntoBuffer(
      fs.createReadStream(filePath),
    )

    const originalImageWidth = await getImageWidth(fileBuffer)

    const { tempSmallFile, tempMediumFile } = await createImageVersions(
      fileBuffer,
      tempDir,
      filenameWithoutExtension,
      originalImageWidth,
      fileEXT,
    )

    return {
      tempOriginalFilePath: filePath,
      tempSmallFile,
      tempMediumFile,
    }
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
  writeFileFromStream,
  handleUnsupportedImageFormats,
  handleImageVersionsCreation,
}
