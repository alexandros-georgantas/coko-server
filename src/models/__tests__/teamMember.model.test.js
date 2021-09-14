const { v4: uuid } = require('uuid')

const { TeamMember, Team, User } = require('../index')
const clearDb = require('./_clearDb')

describe('Team Member Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = TeamMember.knex()
    knex.destroy()
  })

  it('can have a status', async () => {
    const team = await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    const user = await User.insert({})

    const tm = await TeamMember.insert({
      teamId: team.id,
      userId: user.id,
      status: 'someStatus',
    })

    expect(tm.status).toEqual('someStatus')
  })
})
