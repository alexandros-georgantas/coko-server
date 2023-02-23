const config = require('config')

const createCORSConfig = () => {
  if (!config.has('clientUrl')) return null

  return {
    origin: config.get('clientUrl'),
    credentials: true,
  }
}

module.exports = createCORSConfig
