const { v4: uuid } = require('uuid')

const { TeamMember, Team, User } = require('..')
const clearDb = require('./_clearDb')

describe('Team Member Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = TeamMember.knex()
    knex.destroy()
  })

  it('creates a new team member ', async () => {
    const team = await Team.query().insert({
      role: 'author',
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    const user = await User.query().insert({})

    const tm = await TeamMember.query().insert({
      teamId: team.id,
      userId: user.id,
    })

    expect(tm).toBeDefined()
  })

  it('removes a team member ', async () => {
    const team = await Team.query().insert({
      role: 'author',
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    const user = await User.query().insert({})

    const tm = await TeamMember.query().insert({
      teamId: team.id,
      userId: user.id,
    })

    const affectedRows = await TeamMember.deleteById(tm.id)

    expect(affectedRows).toEqual(1)
    await expect(TeamMember.findById(tm.id)).rejects.toThrow()
  })

  it('can have a status ', async () => {
    const team = await Team.query().insert({
      role: 'author',
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    const user = await User.query().insert({})

    const tm = await TeamMember.query().insert({
      teamId: team.id,
      userId: user.id,
      status: 'someStatus',
    })

    expect(tm.status).toEqual('someStatus')
  })
})
