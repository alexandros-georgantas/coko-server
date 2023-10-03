const {
  logger,
  Identity,
  Team,
  TeamMember,
  useTransaction,
} = require('../../src')

const { signUp } = require('../../src/models/user/user.controller')

const seedAdmin = async () => {
  logger.info('Creating admin user')

  try {
    const data = {
      email: 'admin@example.com',
      username: 'admin',
      password: 'password',
    }

    useTransaction(async trx => {
      const userId = await signUp(data, { trx })

      await Identity.query(trx)
        .patch({
          isVerified: true,
        })
        .where({
          email: data.email,
        })

      const adminTeam = await Team.findOne(
        {
          global: true,
          role: 'admin',
        },
        { trx },
      )

      await TeamMember.insert(
        {
          teamId: adminTeam.id,
          memberId: userId,
        },
        { trx },
      )
    })

    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

seedAdmin()
