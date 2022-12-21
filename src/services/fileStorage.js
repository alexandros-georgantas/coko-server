const AWS = require('aws-sdk')
const fs = require('fs-extra')
const config = require('config')
const forEach = require('lodash/forEach')
const sharp = require('sharp')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime-types')
const logger = require('@pubsweet/logger')

const {
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
  writeFileFromStream,
} = require('../helpers')

const { tempFolderPath } = config.get('pubsweet-server')

// Initializing Storage Interface
let s3

const healthCheck = () => {
  try {
    if (!s3) {
      throw new Error(
        's3 does not exist! Probably configuration is missing/invalid',
      )
    }

    const { bucket } = config.get('fileStorage')

    return new Promise((resolve, reject) => {
      s3.getBucketLogging({ Bucket: bucket }, (err, data) => {
        if (err) {
          logger.error(
            'File Storage Healthcheck: Communication to remote file service unsuccessful',
          )
          return reject(err)
        }
        logger.info('File Storage Healthcheck: OK')
        return resolve(data)
      })
    })
  } catch (e) {
    throw new Error(e)
  }
}

const connectToFileStorage = () => {
  if (!config.has('fileStorage')) {
    throw new Error(
      'You have declared that you will use file storage but fileStorage configuration is missing',
    )
  }

  const {
    accessKeyId,
    secretAccessKey,
    bucket,
    protocol,
    host,
    port,
  } = config.get('fileStorage')

  if (!protocol) {
    throw new Error(
      'Missing required protocol param for initializing file storage',
    )
  }
  if (!host) {
    throw new Error('Missing required host param for initializing file storage')
  }

  if (!accessKeyId) {
    throw new Error(
      'Missing required accessKeyId param for initializing file storage',
    )
  }
  if (!accessKeyId) {
    throw new Error(
      'Missing required secretAccessKey param for initializing file storage',
    )
  }
  if (!bucket) {
    throw new Error(
      'Missing required bucket param for initializing file storage',
    )
  }

  const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

  s3 = new AWS.S3({
    accessKeyId,
    signatureVersion: 'v4',
    secretAccessKey,
    s3ForcePathStyle: true,
    endpoint: serverUrl,
  })

  healthCheck()
}

const createImageVersions = async (
  buffer,
  tempDirRoot,
  filenameWithoutExtension,
  originalImageWidth,
  isSVG,
) => {
  try {
    const {
      maximumWidthForSmallImages,
      maximumWidthForMediumImages,
    } = config.get('fileStorage')

    const mediumWidth = maximumWidthForMediumImages
      ? parseInt(maximumWidthForMediumImages, 10)
      : 640

    const smallWidth = maximumWidthForSmallImages
      ? parseInt(maximumWidthForSmallImages, 10)
      : 180

    const smallFilePath = path.join(
      tempDirRoot,
      `${filenameWithoutExtension}_small.${isSVG ? 'svg' : 'jpeg'}`,
    )

    const mediumFilePath = path.join(
      tempDirRoot,
      `${filenameWithoutExtension}_medium.${isSVG ? 'svg' : 'jpeg'}`,
    )

    // all the versions of SVG will be the same as the original file
    if (isSVG) {
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

const getURL = async (objectKey, options = {}) => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')
  const { expiresIn } = options

  const s3Params = {
    Bucket: bucket,
    Key: objectKey,
    Expires: expiresIn || parseInt(86400, 10), // 1 day lease
  }

  return s3.getSignedUrl('getObject', s3Params)
}

const uploadFileHandler = (fileStream, filename, mimetype) => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')
  const params = {
    Bucket: bucket,
    Key: filename, // file name you want to save as
    Body: fileStream,
    ContentType: mimetype,
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      }
      // do we need etag?
      const { Key } = data
      resolve({ key: Key })
    })
  })
}

const handleImageUpload = async (fileStream, hashedFilename) => {
  try {
    const storedObjects = []
    const randomHash = crypto.randomBytes(6).toString('hex')
    const tempDirRoot = tempFolderPath || path.join(process.cwd(), 'temp')
    const tempDir = path.join(tempDirRoot, randomHash)

    await fs.ensureDir(tempDir)
    const filenameWithoutExtension = path.parse(hashedFilename).name
    const tempOriginalFilePath = path.join(tempDir, hashedFilename)
    await writeFileFromStream(fileStream, tempOriginalFilePath)

    const originalFileBuffer = await convertFileStreamIntoBuffer(
      fs.createReadStream(tempOriginalFilePath),
    )

    const {
      width,
      height,
      space,
      density,
      size,
      format,
    } = await getImageFileMetadata(originalFileBuffer)

    const localImageVersionPaths = await createImageVersions(
      originalFileBuffer,
      tempDir,
      filenameWithoutExtension,
      width,
      format === 'svg',
    )

    const { tempSmallFile, tempMediumFile } = localImageVersionPaths

    const mediumImageStream = fs.createReadStream(tempMediumFile)

    const smallImageStream = fs.createReadStream(tempSmallFile)

    const original = await uploadFileHandler(
      fs.createReadStream(tempOriginalFilePath),
      hashedFilename,
      mime.lookup(hashedFilename),
    )

    original.imageMetadata = {
      density,
      height,
      space,
      width,
    }
    original.size = size
    original.extension = `${getFileExtension(hashedFilename)}`
    original.type = 'original'
    original.mimetype = mime.lookup(hashedFilename)

    storedObjects.push(original)

    const medium = await uploadFileHandler(
      fs.createReadStream(tempMediumFile),
      path.basename(tempMediumFile),
      mime.lookup(tempMediumFile),
    )

    const mediumFileBuffer = await convertFileStreamIntoBuffer(
      mediumImageStream,
    )

    const {
      width: mWidth,
      height: mHeight,
      space: mSpace,
      density: mDensity,
      size: mSize,
    } = await getImageFileMetadata(mediumFileBuffer)

    medium.imageMetadata = {
      density: mDensity,
      height: mHeight,
      space: mSpace,
      width: mWidth,
    }
    medium.size = mSize
    medium.extension = `${getFileExtension(tempMediumFile)}`
    medium.type = 'medium'
    medium.mimetype = mime.lookup(tempMediumFile)

    storedObjects.push(medium)

    const small = await uploadFileHandler(
      fs.createReadStream(tempSmallFile),
      path.basename(tempSmallFile),
      mime.lookup(tempSmallFile),
    )

    const smallFileBuffer = await convertFileStreamIntoBuffer(smallImageStream)

    const {
      width: sWidth,
      height: sHeight,
      space: sSpace,
      density: sDensity,
      size: sSize,
    } = await getImageFileMetadata(smallFileBuffer)

    small.imageMetadata = {
      density: sDensity,
      height: sHeight,
      space: sSpace,
      width: sWidth,
    }
    small.size = sSize
    small.extension = `${getFileExtension(tempSmallFile)}`
    small.type = 'small'
    small.mimetype = mime.lookup(tempSmallFile)

    storedObjects.push(small)

    await fs.remove(tempDir)

    return storedObjects
  } catch (e) {
    throw new Error(e)
  }
}

// Returns an array of stored objects
// [{
//  type: String (values: original/small/medium),
//  key: String
//  mimetype: String
//  extension: String
//  size: Integer
// }]

const upload = async (fileStream, filename, options = {}) => {
  try {
    if (!filename) {
      throw new Error('filename is required')
    }
    const { forceFilenameAsObjectKey } = options

    const mimetype = mime.lookup(filename)
    let storedObjects = []
    let hashedFilename

    if (forceFilenameAsObjectKey) {
      hashedFilename = filename
    } else {
      hashedFilename = `${crypto
        .randomBytes(6)
        .toString('hex')}${getFileExtension(filename, true)}`
    }

    if (!mimetype.match(/^image\//)) {
      const storedObject = await uploadFileHandler(
        fileStream,
        hashedFilename,
        mimetype,
      )

      const { ContentLength } = await getFileInfo(storedObject.key)
      storedObject.type = 'original'
      storedObject.size = ContentLength
      storedObject.extension = `${getFileExtension(filename)}`
      storedObject.mimetype = mimetype
      storedObjects.push(storedObject)
      return storedObjects
    }

    storedObjects = await handleImageUpload(
      fileStream,
      hashedFilename,
      mimetype,
    )

    return storedObjects
  } catch (e) {
    throw new Error(e)
  }
}

const getFileInfo = key => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')
  const params = {
    Bucket: bucket,
    Key: key,
  }

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data)
    })
  })
}

const list = () => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')
  const params = {
    Bucket: bucket,
  }

  return new Promise((resolve, reject) => {
    s3.listObjects(params, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data)
    })
  })
}

// Accepts an array of object keys
const deleteFiles = objectKeys => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')

  if (objectKeys.length === 0) {
    throw new Error('the provided array of keys if empty')
  }

  const params = {
    Bucket: bucket,
    Delete: {
      Objects: [],
      Quiet: false,
    },
  }

  forEach(objectKeys, objectKey => {
    params.Delete.Objects.push({ Key: objectKey })
  })

  return new Promise((resolve, reject) => {
    s3.deleteObjects(params, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data)
    })
  })
}

const download = (key, localPath) => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')
  const fileStream = fs.createWriteStream(localPath)
  const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream()

  return new Promise((resolve, reject) => {
    // Listen for errors returned by the service
    s3Stream.on('error', err => {
      // NoSuchKey: The specified key does not exist
      reject(err)
    })

    s3Stream
      .pipe(fileStream)
      .on('error', err => {
        // capture any errors that occur when writing data to the file
        reject(err)
        console.error('File Stream:', err)
      })
      .on('close', () => {
        resolve()
      })
  })
}

module.exports = {
  connectToFileStorage,
  healthCheck,
  getURL,
  upload,
  deleteFiles,
  list,
  download,
}
