const { rule } = require('graphql-shield')
const path = require('path')
const sharp = require('sharp')

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return !!ctx.user
})

const isAdmin = rule()(
  async (parent, args, { user: userId, connectors: { User } }, info) => {
    if (!userId) {
      return false
    }

    const user = await User.model.findById(userId)
    return user.admin
  },
)

const convertFileStreamIntoBuffer = async fileStream => {
  return new Promise((resolve, reject) => {
    // Store file data chunks
    const chunks = []

    // Throw if error occurred
    fileStream.once('error', err => {
      reject(err)
    })

    // File is done being read
    fileStream.once('end', () => {
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
    const metadata = await originalImage.metadata()
    return metadata
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  isAuthenticated,
  isAdmin,
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
}
