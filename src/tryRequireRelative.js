const logger = require('@pubsweet/logger')

const tryRequireRelative = m => {
  let component

  try {
    /* eslint-disable-next-line import/no-dynamic-require, global-require */
    component = require(require.resolve(m, { paths: [process.cwd()] }))
  } catch (err) {
    logger.error(`Unable to load component ${m} on the server.`)
    logger.error(err)
    component = {}
  }

  return component
}

module.exports = tryRequireRelative
