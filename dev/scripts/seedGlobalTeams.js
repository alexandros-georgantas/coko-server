const config = require('config')

const { logger, useTransaction } = require('../../src')
const Team = require('../../src/models/team/team.model')

const seedGlobalTeams = async () => {
  logger.info('Seeding global teams...')

  if (!config.has('teams.global')) {
    logger.info('No global teams declared in config')
    process.exit(0)
  }

  try {
    const configGlobalTeams = config.get('teams.global')

    useTransaction(async trx => {
      await Promise.all(
        Object.keys(configGlobalTeams).map(async k => {
          const teamData = configGlobalTeams[k]

          const exists = await Team.findOne(
            {
              global: true,
              role: teamData.role,
            },
            { trx },
          )

          if (exists) {
            logger.info(
              `[seedGlobalTeams]: Global team "${teamData.role}" already exists`,
            )
            return
          }

          await Team.insert(
            {
              ...teamData,
              global: true,
            },
            { trx },
          )

          logger.info(`[seedGlobalTeams]: Added global team "${teamData.role}"`)
        }),
      )
    })

    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

seedGlobalTeams()
