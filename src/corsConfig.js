const config = require('config')

const createCORSConfig = () => {
  if (!config.has('pubsweet-client.url')) return null

  const clientUrl = config.has('clientUrl') && config.get('clientUrl')

  return {
    origin: clientUrl,
    credentials: true,
  }
}

module.exports = createCORSConfig
