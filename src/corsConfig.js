const config = require('config')

const createCORSConfig = () => {
  if (!config.has('pubsweet-client.host')) return null

  const clientProtocol =
    (config.has('pubsweet-client.protocol') &&
      config.get('pubsweet-client.protocol')) ||
    'http'

  let clientHost = config.get('pubsweet-client.host')

  const clientPort =
    config.has('pubsweet-client.port') && config.get('pubsweet-client.port')

  // This is here because webpack dev server might need to be started with
  // 0.0.0.0 instead of localhost, but the incoming request will still be
  // eg. http://localhost:4000, not http://0.0.0.0:4000, which will make
  // the CORS check fail
  if (clientHost === '0.0.0.0' || clientHost === '127.0.0.1') {
    clientHost = 'localhost'
  }

  const clientUrl = `${clientProtocol}://${clientHost}${
    clientPort ? `:${clientPort}` : ''
  }`

  return {
    origin: clientUrl,
    credentials: true,
  }
}

module.exports = createCORSConfig
