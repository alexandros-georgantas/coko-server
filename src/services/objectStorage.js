const AWS = require('aws-sdk')
const fs = require('fs-extra')
const config = require('config')
const forEach = require('lodash/forEach')
const sharp = require('sharp')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime-types')

const {
  rootUser,
  rootUserPassword,
  bucket,
  protocol,
  host,
  port,
  maximumWidthForSmallImages,
  maximumWidthForMediumImages,
} = config.get('file-server')

const { tempFolderPath } = config.get('pubsweet-server')

const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

const {
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
  writeFileFromStream,
} = require('../helpers')

// Initializing Storage Interface
const s3 = new AWS.S3({
  accessKeyId: rootUser,
  signatureVersion: 'v4',
  secretAccessKey: rootUserPassword,
  s3ForcePathStyle: true,
  endpoint: serverUrl,
})

const createImageVersions = async (
  buffer,
  tempDirRoot,
  filenameWithoutExtension,
  originalImageWidth,
  isSVG,
) => {
  try {
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

const healthCheck = () =>
  new Promise((resolve, reject) => {
    s3.getBucketLogging({ Bucket: bucket }, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })

// getObject, putObject
const signURL = async (key, operation = 'getObject', expiresIn = 86400) => {
  const s3Params = {
    Bucket: bucket,
    Key: key,
    Expires: parseInt(expiresIn, 10), // 1 day lease
  }

  return s3.getSignedUrl(operation, s3Params)
}

const uploadFileHandler = (fileStream, filename, mimetype) => {
  // console.log('HHHHHHH', fileStream)

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

      const { Key, ETag } = data
      resolve({ key: Key, eTag: ETag })
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

    original.metadata = {
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
    // console.log('here2', storedObjects)

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

    medium.metadata = {
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

    small.metadata = {
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

const uploadFile = async (
  fileStream,
  filename,
  forceFilenameAsObjectKey = false,
) => {
  try {
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

const listFiles = () => {
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

// Accepts an array of file keys
const deleteRemoteFiles = keys => {
  if (keys.length === 0) {
    throw new Error('the provided array of keys if empty')
  }

  const params = {
    Bucket: bucket,
    Delete: {
      Objects: [],
      Quiet: false,
    },
  }

  forEach(keys, key => {
    params.Delete.Objects.push({ Key: key })
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

const locallyDownloadFile = (key, where) => {
  const fileStream = fs.createWriteStream(where)
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
  healthCheck,
  signURL,
  uploadFile,
  deleteRemoteFiles,
  listFiles,
  locallyDownloadFile,
}
