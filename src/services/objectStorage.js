const AWS = require('aws-sdk')
const fs = require('fs-extra')
const config = require('config')
const forEach = require('lodash/forEach')
const sharp = require('sharp')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime-types')

const {
  accessKeyId,
  secretAccessKey,
  bucket,
  protocol,
  host,
  port,
} = config.get('file-server')

const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

const {
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
} = require('../helpers')

// Initializing Storage Interface
const s3 = new AWS.S3({
  accessKeyId,
  signatureVersion: 'v4',
  secretAccessKey,
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
    const smallFilePath = path.join(
      tempDirRoot,
      `${filenameWithoutExtension}_small.${isSVG ? 'svg' : 'pmg'}`,
    )
    const mediumFilePath = path.join(
      tempDirRoot,
      `${filenameWithoutExtension}_medium.${isSVG ? 'svg' : 'pmg'}`,
    )

    // all the versions of SVG will be the same as the original file
    if (isSVG) {
      await sharp(buffer).toFile(smallFilePath)
      await sharp(buffer).toFile(mediumFilePath)

      return {
        tempSmallFile: {
          path: smallFilePath,
          type: 'small',
        },
        tempMediumFile: {
          path: mediumFilePath,
          type: 'medium',
        },
      }
    }

    await sharp(buffer)
      .resize(180, 240, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0.0 },
      })
      .toFile(smallFilePath)

    if (originalImageWidth < 640) {
      await sharp(buffer).toFile(mediumFilePath)
    } else {
      await sharp(buffer).resize({ width: 640 }).toFile(mediumFilePath)
    }

    return {
      tempSmallFile: {
        path: smallFilePath,
        type: 'small',
      },
      tempMediumFile: {
        path: mediumFilePath,
        type: 'medium',
      },
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
const signURL = async (operation, key) => {
  const s3Params = {
    Bucket: bucket,
    Key: key,
    Expires: 86400, // 1 day lease
  }

  return s3.getSignedUrl(operation, s3Params)
}

const uploadFileHandler = (fileStream, filename, mimetype) => {
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
      const { Key, Bucket, ETag, Location } = data
      resolve({ key: Key, bucket: Bucket, eTag: ETag, location: Location })
    })
  })
}

const handleImageUpload = async (fileStream, hashedFilename, mimetype) => {
  try {
    const storedObjects = []
    const randomHash = crypto.randomBytes(6).toString('hex')
    const tempDirRoot = path.join(process.cwd(), 'temp', randomHash)

    await fs.ensureDir(tempDirRoot)
    const filenameWithoutExtension = path.parse(hashedFilename).name

    // Don't store original file into disk as it could be huge.
    const originalFileBuffer = await convertFileStreamIntoBuffer(fileStream)
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
      tempDirRoot,
      filenameWithoutExtension,
      width,
      format === 'svg',
    )

    const { tempSmallFile, tempMediumFile } = localImageVersionPaths

    const mediumImageStream = fs.createReadStream(tempSmallFile)
    const smallImageStream = fs.createReadStream(tempMediumFile)

    const original = await uploadFileHandler(
      fileStream,
      hashedFilename,
      mimetype,
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

    storedObjects.push(original)

    const medium = await uploadFileHandler(
      mediumImageStream,
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

    storedObjects.push(medium)

    const small = await uploadFileHandler(
      smallImageStream,
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
    medium.size = sSize
    medium.extension = `${getFileExtension(tempSmallFile)}`
    medium.type = 'small'

    storedObjects.push(small)

    await fs.remove(tempDirRoot)

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
const deleteFiles = keys => {
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
  deleteFiles,
  getFileInfo,
  listFiles,
  locallyDownloadFile,
}
