const { clientUrl } = require('./utils/urls')

const createCORSConfig = () => {
  if (!clientUrl) return null
  return {
    origin: clientUrl,
    credentials: true,
  }
}

module.exports = createCORSConfig
