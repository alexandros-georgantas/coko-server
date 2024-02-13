const { extname, resolve } = require('path')
const fs = require('fs-extra')
const tmp = require('tmp-promise')
const Umzug = require('umzug')

const logger = require('../logger')

const db = require('./db')
const storage = require('./umzugStorage')

tmp.setGracefulCleanup()

// Load SQL files as migrations
const sqlResolver = filePath => ({
  up: async database => {
    const fileContents = await fs.readFile(filePath, 'utf-8')
    return database.raw(fileContents)
  },
})

const getUmzug = async migrationsPaths => {
  // Collect up all migrations to be run
  const { path: tmpDir, cleanup } = await tmp.dir({
    prefix: '_migrations-',
    unsafeCleanup: true,
    dir: process.cwd(),
  })

  // Filter out any migration paths that do not exist
  await Promise.all(
    migrationsPaths.map(async migrationPath => {
      if (await fs.exists(migrationPath)) {
        // During tests, we want to collect coverage for migrations
        if (process.env.NODE_ENV === 'test') {
          const files = await fs.readdir(migrationPath)

          const symlinks = files.map(file =>
            fs.symlink(resolve(migrationPath, file), resolve(tmpDir, file)),
          )

          await Promise.all(symlinks)
        } else {
          await fs.copy(migrationPath, tmpDir)
        }
      }
    }),
  )

  const umzug = new Umzug({
    storage,
    logging: logger.debug.bind(logger),
    migrations: {
      path: tmpDir,
      params: [db],
      pattern: /\d+-[\w-]+\.(js|sql)/,
      customResolver: filePath => {
        if (extname(filePath) === '.sql') {
          return sqlResolver(filePath)
        }

        /* eslint-disable-next-line import/no-dynamic-require, global-require */
        return require(filePath)
      },
    },
  })

  return { cleanup, umzug }
}

module.exports = getUmzug
