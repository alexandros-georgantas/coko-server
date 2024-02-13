const logger = require('../logger')

const getUmzug = require('./umzug')

const migrate = async options => {
  /* eslint-disable-next-line global-require */
  const getMigrationPaths = require('./migrationPaths')
  const { umzug, cleanup } = await getUmzug(getMigrationPaths())

  try {
    await umzug.up(options)
  } catch (e) {
    logger.error('Error while running migrations:', e.message)
    throw e
  } finally {
    await cleanup()
  }
}

module.exports = migrate
