const { User, Team } = require('@pubsweet/models')

const { v4: uuid } = require('uuid')

const config = require('config')
const { api } = require('../../test')
const fixtures = require('./fixtures')

// const authentication = require('pubsweet-server/src/authentication')
const globalTeams = config.get('teams.global')
const nonGlobalTeams = config.get('teams.nonglobal')

const clearDb = require('./_clearDb')

describe('Team queries', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  test("lists a user's teams", async () => {
    let token

    const team = await Team.query().insert({
      role: nonGlobalTeams.AUTHOR,
      name: 'Test',
      global: false,
      objectId: uuid(),
      objectType: 'unknown',
    })

    const user = await User.query().insert({ ...fixtures.user })

    const tm = await Team.addMember(team.id, user.id)

    expect(tm).toBeDefined()

    // console.log(api)

    const { body } = await api.graphql.query(
      `query {
        users {
          id
          teams {
            members {
              user {
                id
              }
            }
          }
        }
      }`,
      {},
      token,
    )

    expect(body.data.users[0].teams[0].members[0].user.id).toEqual(user.id)
  })
})
