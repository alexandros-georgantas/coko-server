const fs = require('fs')
const path = require('path')

const { logger } = require('../../src')

const ensureTempFolderExists = () => {
  logger.info('Ensuring "tmp" folder exists...')

  try {
    const tempFolderPath = path.join(__dirname, '..', 'tmp')

    fs.stat(tempFolderPath, (err, stats) => {
      if (err || !stats.isDirectory()) {
        logger.info(
          '[ensureTempFolderExists]: "tmp" folder does not exist. Creating...',
        )
        fs.mkdirSync(tempFolderPath)
        logger.info('[ensureTempFolderExists]: "tmp" folder created')
      } else {
        logger.info('[ensureTempFolderExists]: "tmp" folder already exists')
      }
    })

    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

ensureTempFolderExists()
