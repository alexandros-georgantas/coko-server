// const axios = require('axios')
const { URL } = require('url')
const { rule } = require('graphql-shield')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs-extra')
const jwt = require('jsonwebtoken')
const config = require('config')
const { User: dbUser } = require('@pubsweet/models')
// const get = require('lodash/get')

// const { ServiceCredential } = require('./models')

// const services = config.get('services')

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

// const serviceHandshake = async (which, renew = false) => {
//   if (!services) {
//     throw new Error('services are undefined')
//   }

//   const service = get(services, `${which}`)

//   if (!service) {
//     throw new Error(`service ${which} configuration is undefined `)
//   }

//   const foundServiceCredential = await ServiceCredential.query().findOne({
//     name: which,
//   })

//   const { clientId, clientSecret, port, protocol, host } = service
//   const buff = Buffer.from(`${clientId}:${clientSecret}`, 'utf8')
//   const base64data = buff.toString('base64')

//   const serviceURL = `${protocol}://${host}${port ? `:${port}` : ''}`

//   const serviceHealthCheck = await axios({
//     method: 'get',
//     url: `${serviceURL}/healthcheck`,
//   })

//   const { data: healthCheckData } = serviceHealthCheck
//   const { message } = healthCheckData

//   if (message !== 'Coolio') {
//     throw new Error(`service ${which} is down`)
//   }

//   return new Promise((resolve, reject) => {
//     axios({
//       method: 'post',
//       url: `${serviceURL}/api/auth`,
//       headers: { authorization: `Basic ${base64data}` },
//     })
//       .then(async ({ data }) => {
//         const { accessToken } = data

//         if (!renew && !foundServiceCredential) {
//           await ServiceCredential.query().insert({
//             name: which,
//             accessToken,
//           })
//           resolve()
//         }

//         await ServiceCredential.query().patchAndFetchById(
//           foundServiceCredential.id,
//           {
//             accessToken,
//           },
//         )
//         resolve()
//       })
//       .catch(async err => {
//         const { response } = err

//         if (foundServiceCredential) {
//           await ServiceCredential.query().patchAndFetchById(
//             foundServiceCredential.id,
//             {
//               accessToken: null,
//             },
//           )
//         }

//         if (!response) {
//           return reject(new Error(`Request failed with message: ${err.code}`))
//         }

//         const { status, data } = response
//         const { msg } = data
//         return reject(
//           new Error(`Request failed with status ${status} and message: ${msg}`),
//         )
//       })
//   })
// }

const authenticateWS = async req => {
  try {
    const serverURL = config.has('pubsweet-server.publicURL')
      ? config.get('pubsweet-server.publicURL')
      : config.get('pubsweet-server.baseUrl')

    const url = new URL(req.url, serverURL)

    const token = url.searchParams.get('token')
    let foundUser = false
    if (token) {
      const decoded = jwt.verify(token, config.get('pubsweet-server.secret'))
      if (decoded) {
        const user = await dbUser.query().findById(decoded.id)
        if (user) {
          foundUser = true
        }
      }
    }
    return foundUser
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
  writeFileFromStream,
  authenticateWS,
  // serviceHandshake,
}
