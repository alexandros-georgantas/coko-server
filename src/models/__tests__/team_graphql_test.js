const { User, Team, ChatThread } = require('@pubsweet/models')

const { v4: uuid } = require('uuid')

const config = require('config')
const authentication = require('pubsweet-server/src/authentication')
const { api } = require('../../../test')
const fixtures = require('./fixtures')

const globalTeams = config.get('teams.global')
const nonGlobalTeams = config.get('teams.nonglobal')

const clearDb = require('./_clearDb')

describe('Team queries', () => {
  let user
  let token

  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  const whereQuery = async where => {
    const { body } = await api.graphql.query(
      `query($where: TeamWhereInput) {
          teams(where: $where) {
            name
            object {
              objectId
              objectType
            }
            members {
              user {
                id
              }
            }
          }
        }`,
      {
        where,
      },
      token,
    )

    return body
  }

  test("lists a user's teams", async () => {
    const team = await Team.query().insert({
      role: nonGlobalTeams.AUTHOR,
      name: 'Test',
      global: false,
      objectId: uuid(),
      objectType: 'unknown',
    })

    user = await User.query().insert({ ...fixtures.user })

    const tm = await Team.addMember(team.id, user.id)

    expect(tm).toBeDefined()

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

    expect(body.data.users[0].teams[0]).toBeDefined()

    expect(body.data.users[0].teams[0].members[0].user.id).toEqual(user.id)
  })

  test('creates a team with members or without', async () => {
    user = await User.query().insert({ ...fixtures.user })
    token = authentication.token.create(user)

    const noMembers = []

    const yesMembers = [
      {
        user: { id: user.id },
      },
    ]

    const promises = [noMembers, yesMembers].map(async members => {
      const { body } = await api.graphql.query(
        `mutation($input: TeamInput) {
            createTeam(input: $input) {
              name
              members {
                user {
                  id
                }
              }
            }
          }`,
        {
          input: {
            name: 'My team',
            role:
              members.length === 0 ? globalTeams.AUTHOR : globalTeams.EDITOR,
            global: true,
            members,
          },
        },
        token,
      )

      expect(body).toEqual({
        data: {
          createTeam: {
            name: 'My team',
            members,
          },
        },
      })
    })

    await Promise.all(promises)
  })

  it('can query a team saved directly', async () => {
    user = await User.query().insert({ ...fixtures.user })
    token = authentication.token.create(user)

    const team = await Team.query().insert({
      name: 'NoMembers',
      role: globalTeams.AUTHOR,
      global: true,
    })

    const { body } = await api.graphql.query(
      `query($id: ID) {
          team(id: $id) {
            name
            members {
              user {
                id
              }
            }
          }
        }`,
      { id: team.id },
      token,
    )

    expect(body.data.team).toEqual({
      name: 'NoMembers',
      members: [],
    })
  })

  it('can update a team and its members', async () => {
    user = await User.query().insert({ ...fixtures.user })
    token = authentication.token.create(user)

    const team = await Team.query().insert({
      name: 'Before',
      role: globalTeams.EDITOR,
      global: true,
    })

    const { body } = await api.graphql.query(
      `mutation($id: ID, $input: TeamInput) {
            updateTeam(id: $id, input: $input) {
              name
              members {
                user {
                  id
                }
              }
            }
          }`,
      {
        id: team.id,
        input: {
          name: 'After',
          role: globalTeams.EDITOR,
          members: [{ user: { id: user.id } }],
        },
      },
      token,
    )

    expect(body).toEqual({
      data: {
        updateTeam: {
          name: 'After',
          members: [{ user: { id: user.id } }],
        },
      },
    })
  })

  it('can update a team and also remove members', async () => {
    user = await User.query().insert({ ...fixtures.user })
    token = authentication.token.create(user)

    const otherUser = await User.query().insert({ ...fixtures.otherUser })

    const team = await Team.query().upsertGraphAndFetch(
      {
        role: globalTeams.AUTHOR,
        global: true,
        name: 'Test',
        members: [{ user: { id: user.id } }, { user: { id: otherUser.id } }],
      },
      { relate: true, unrelate: true },
    )

    const { body } = await api.graphql.query(
      `mutation($id: ID, $input: TeamInput) {
            updateTeam(id: $id, input: $input) {
              name
              members {
                id
                user {
                  id
                }
              }
            }
          }`,
      {
        id: team.id,
        input: {
          name: 'After',
          role: globalTeams.AUTHOR,
          members: [{ id: team.members[0].id }],
        },
      },
      token,
    )

    expect(body).toEqual({
      data: {
        updateTeam: {
          name: 'After',
          members: [
            { id: team.members[0].id, user: { id: team.members[0].user.id } },
          ],
        },
      },
    })

    // The team should no longer have the user as a member
    const updatedTeam = await Team.query()
      .findById(team.id)
      .withGraphFetched('members')

    expect(updatedTeam.members).toHaveLength(1)

    // But the user should not be deleted
    expect(await User.query()).toHaveLength(2)
  })

  it('finds a team', async () => {
    user = await User.query().insert({ ...fixtures.user })
    token = authentication.token.create(user)

    const team = await Team.query().insert({
      role: nonGlobalTeams.AUTHOR,
      name: 'Test',
      objectId: user.id,
      objectType: 'user',
    })

    const { body } = await api.graphql.query(
      `query($id: ID) {
          team(id: $id) {
            name
          }
        }`,
      { id: team.id },
      token,
    )

    expect(body.data.team.name).toEqual('Test')
  })

  it('finds a team by role', async () => {
    await Team.query().insert({
      role: globalTeams.EDITOR,
      name: 'DoesntMatch',
      global: true,
    })
    await Team.query().insert({
      role: globalTeams.AUTHOR,
      name: 'Test',
      global: true,
    })

    const body = await whereQuery({
      role: globalTeams.AUTHOR,
    })

    expect(body.data.teams).toHaveLength(1)
    expect(body.data.teams[0].name).toEqual('Test')
  })

  it('find a team by role and object', async () => {
    user = await User.query().insert({ ...fixtures.user })
    token = authentication.token.create(user)

    const fragment = await ChatThread.query().insert({
      chatType: 'post',
      relatedObjectId: uuid(),
    })

    await Team.query().upsertGraph(
      {
        role: nonGlobalTeams.AUTHOR,
        name: 'Test',
        objectId: fragment.id,
        objectType: 'fragment',
        members: [{ id: user.id }],
      },
      { relate: true, unrelate: true },
    )

    const body = await whereQuery({
      role: nonGlobalTeams.AUTHOR,
      objectId: fragment.id,
      objectType: 'fragment',
    })

    expect(body.data.teams).toHaveLength(1)
  })

  describe('find a team by role, object, and member', () => {
    let fragment
    let user2

    beforeEach(async () => {
      user = await User.query().insert({ ...fixtures.user })
      token = authentication.token.create(user)

      fragment = await ChatThread.query().insert({
        chatType: 'post',
        relatedObjectId: uuid(),
      })

      user2 = await User.query().insert({ ...fixtures.otherUser })

      await Team.query().upsertGraph(
        {
          role: nonGlobalTeams.EDITOR,
          name: 'Test',
          objectId: fragment.id,
          objectType: 'fragment',
          members: [
            {
              user: { id: user.id },
            },
            {
              user: { id: user2.id },
            },
          ],
        },
        { relate: true, unrelate: true },
      )
    })

    it('finds a team for 1 user (through members)', async () => {
      const body = await whereQuery({
        role: nonGlobalTeams.EDITOR,
        objectId: fragment.id,
        objectType: 'fragment',
        users: [user.id],
      })

      expect(body.data.teams).toHaveLength(1)
      expect(body.data.teams[0].object).toEqual({
        objectId: fragment.id,
        objectType: 'fragment',
      })
      expect(body.data.teams[0].members).toHaveLength(2)
    })

    it('finds a team by ID of a member', async () => {
      const body = await whereQuery({
        role: nonGlobalTeams.EDITOR,
        objectId: fragment.id,
        objectType: 'fragment',
        users: [user2.id],
      })

      expect(body.data.teams).toHaveLength(1)
    })

    it('finds a team for both members', async () => {
      const body = await whereQuery({
        role: nonGlobalTeams.EDITOR,
        objectId: fragment.id,
        objectType: 'fragment',
        users: [user.id, user2.id],
      })

      expect(body.data.teams).toHaveLength(1)
    })

    it('does not find a team for non-existent member', async () => {
      const body = await whereQuery({
        role: nonGlobalTeams.EDITOR,
        objectId: fragment.id,
        objectType: 'fragment',
        users: ['54513de6-b473-4b39-8f95-bcbb3ae58a2a'],
      })

      expect(body.data.teams).toHaveLength(0)
    })

    it('does not find a team if one of the members is wrong', async () => {
      const body = await whereQuery({
        role: nonGlobalTeams.EDITOR,
        objectId: fragment.id,
        objectType: 'fragment',
        users: [user.id, user2.id, '54513de6-b473-4b39-8f95-bcbb3ae58a2a'],
      })

      expect(body.data.teams).toHaveLength(0)
    })
  })
})
