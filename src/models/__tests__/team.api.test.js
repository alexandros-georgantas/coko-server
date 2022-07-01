const createTestServer = require('./helpers/createTestServer')
const { Team, TeamMember, User } = require('..')

const clearDb = require('./_clearDb')

describe('Team API', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  it('tests', async () => {
    const globalTeam = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const user = await User.insert({})

    const member = await TeamMember.insert({
      teamId: globalTeam.id,
      userId: user.id,
    })

    const GET_GLOBAL_TEAMS = `
      query GetGlobalTeams {
        getGlobalTeams {
          result {
            id
            members {
              id
              user {
                id
              }
            }
          }
          totalCount
        }
      }
    `

    const testServer = await createTestServer()

    const result = await testServer.executeOperation({
      query: GET_GLOBAL_TEAMS,
    })

    const data = result.data.getGlobalTeams

    expect(data.totalCount).toBe(1)
    expect(data.result).toHaveLength(1)
    const foundTeam = data.result[0]
    expect(foundTeam.id).toEqual(globalTeam.id)

    expect(foundTeam.members).toHaveLength(1)
    const foundMember = foundTeam.members[0]
    expect(foundMember.id).toEqual(member.id)

    const foundUser = foundMember.user
    expect(foundUser.id).toEqual(user.id)

    expect(true).toBe(true)
  })
})
