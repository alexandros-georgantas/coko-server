const { v4: uuid } = require('uuid')
const config = require('config')
const { Team, TeamMember, User, ChatThread } = require('../index')
const clearDb = require('./_clearDb')

const globalTeams = config.get('teams.global')
const nonGlobalTeams = config.get('teams.nonglobal')

describe('Team Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  test('creates a new team', async () => {
    const team = await Team.query().insert({
      role: 'author',
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    expect(team).toBeDefined()
    expect(team.role).toEqual('author')
  })

  test('creates a new global team', async () => {
    const team = await Team.query().insert({
      role: 'editor',
      global: true,
    })

    expect(team).toBeDefined()
    expect(team.global).toBeTruthy()
  })

  test('global teams are unique', async () => {
    await Team.query().insert({
      role: 'editor',
      global: true,
    })

    const createDuplicate = () =>
      Team.query().insert({
        role: 'editor',
        global: true,
      })

    await expect(createDuplicate()).rejects.toThrow()
  })

  test('non-global teams are unique per object', async () => {
    const id = uuid()

    await Team.query().insert({
      role: 'author',
      objectId: id,
      objectType: 'unknownObject',
    })

    const second = await Team.query().insert({
      role: 'author',
      objectId: uuid(), // different object id
      objectType: 'unknownObject',
    })

    const createDuplicate = () =>
      Team.query().insert({
        role: 'author',
        objectId: id, // same object id
        objectType: 'unknownObject',
      })

    expect(second).toBeDefined()
    await expect(createDuplicate()).rejects.toThrow()
  })

  test('global teams must not have an associated object', async () => {
    const create = () =>
      Team.query().insert({
        role: 'editor',
        global: true,
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    await expect(create()).rejects.toThrow()
  })

  test('non-global teams must have an associated object', async () => {
    const create = () =>
      Team.query().insert({
        role: 'author',
      })

    await expect(create()).rejects.toThrow()
  })

  test('only accepts valid roles', async () => {
    const createTeam = () =>
      Team.query().insert({
        role: 'lorem ipsum',
      })

    await expect(createTeam()).rejects.toThrow()
  })

  test('global teams should only accept global roles', async () => {
    const createValid = () =>
      Team.query().insert({
        role: 'editor',
        global: true,
      })

    const createInvalid = () =>
      Team.query().insert({
        role: 'non-global-role',
        global: true,
      })

    const globalTeam = await createValid()
    expect(globalTeam.id).toBeDefined()
    await expect(createInvalid()).rejects.toThrow()
  })

  test('non-global teams should only accept non-global roles', async () => {
    const createValid = () =>
      Team.query().insert({
        role: 'author',
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    const createInvalid = () =>
      Team.query().insert({
        role: 'global-role',
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    const validTeam = await createValid()
    expect(validTeam.id).toBeDefined()
    await expect(createInvalid()).rejects.toThrow()
  })

  test('finds all global teams', async () => {
    await Team.query().insert([
      {
        role: 'editor',
        global: true,
      },
      {
        role: 'author',
        global: true,
      },
    ])

    const teams = await Team.findAllGlobalTeams()
    expect(teams.length).toEqual(2)

    const curatorTeam = teams.find(t => t.role === 'editor')
    expect(curatorTeam).toBeDefined()
    expect(curatorTeam.global).toBeTruthy()

    const sectionEditorTeam = teams.find(t => t.role === 'author')
    expect(sectionEditorTeam).toBeDefined()
    expect(sectionEditorTeam.global).toBeTruthy()
  })

  test('finds global teams by role', async () => {
    await Team.query().insert({
      role: 'editor',
      global: true,
    })

    const res = await Team.findGlobalTeamByRole('editor')

    expect(res).toBeDefined()
    expect(res.role).toEqual('editor')
    expect(res.global).toBeTruthy()
  })

  test('finds teams by role and object', async () => {
    const objectId = uuid()
    const objectType = 'lorem'

    const REVIEWER_ROLE = 'editor'

    await Team.query().insert({
      role: 'author',
      objectId,
      objectType,
    })

    await Team.query().insert({
      role: REVIEWER_ROLE,
      objectId,
      objectType,
    })

    const authorTeam = await Team.findTeamByRoleAndObject('author', objectId)

    expect(authorTeam).toBeDefined()
    expect(authorTeam.role).toEqual('author')
    expect(authorTeam.global).toBeFalsy()

    const reviewerTeam = await Team.findTeamByRoleAndObject(
      REVIEWER_ROLE,
      objectId,
    )

    expect(reviewerTeam).toBeDefined()
    expect(reviewerTeam.role).toEqual(REVIEWER_ROLE)
    expect(reviewerTeam.global).toBeFalsy()
  })

  test('adds member to team', async () => {
    const team = await Team.query().insert({
      role: 'editor',
      global: true,
    })

    const user = await User.query().insert({})

    await Team.addMember(team.id, user.id)

    const member = await TeamMember.query().findOne({
      teamId: team.id,
      userId: user.id,
    })

    expect(member).toBeDefined()
  })

  /**
   * Logic here is as follows:
   * - create two users
   * - make them both global curators
   * - make them each a curator on a different chat thread
   * - remove the first user from the global team
   * - first user should automatically be removed from the non-global team as well
   */
  test('removes member from team', async () => {
    const users = await User.query().insert([{}, {}])

    const globalCurators = await Team.query().insert({
      role: 'editor',
      global: true,
    })

    await TeamMember.query().insert(
      users.map(user => ({
        teamId: globalCurators.id,
        userId: user.id,
      })),
    )

    const chatTeams = []

    await Promise.all(
      [0, 1].map(async index => {
        const ct = await ChatThread.query().insert({
          chatType: 'reviewer',
          relatedObjectId: uuid(),
        })

        const team = await Team.query().insert({
          role: 'editor',
          objectId: ct.id,
          objectType: 'chatthread',
        })

        chatTeams.push(team)

        await TeamMember.query().insert({
          teamId: team.id,
          userId: users[index].id,
        })
      }),
    )

    await Team.removeMember(globalCurators.id, users[0].id)

    const globalCuratorMembers = await TeamMember.query().where({
      teamId: globalCurators.id,
    })

    expect(globalCuratorMembers.length).toEqual(1)
    expect(globalCuratorMembers[0].userId).toEqual(users[1].id)

    const membersOfChatOne = await TeamMember.query().where({
      teamId: chatTeams[0].id,
    })

    expect(membersOfChatOne.length).toEqual(0)

    const membersOfChatTwo = await TeamMember.query().where({
      teamId: chatTeams[1].id,
    })

    expect(membersOfChatTwo.length).toEqual(1)
    expect(membersOfChatTwo[0].userId).toEqual(users[1].id)
  })

  test('updates team membership given an array of user ids', async () => {
    const userOne = await User.query().insert({})
    const userTwo = await User.query().insert({})
    const userThree = await User.query().insert({})

    const curatorTeam = await Team.query().insert({
      role: 'editor',
      global: true,
    })

    const sectionEditorTeam = await Team.query().insert({
      role: 'author',
      global: true,
    })

    // initial: curators: [userOne], sectionEditors: [userTwo]
    await TeamMember.query().insert([
      {
        teamId: curatorTeam.id,
        userId: userOne.id,
      },
      {
        teamId: sectionEditorTeam.id,
        userId: userTwo.id,
      },
    ])

    // changed: curators: [userOne, userThree], sectionEditors: []
    await Team.updateMembershipByTeamId(curatorTeam.id, [
      userOne.id,
      userThree.id,
    ])

    await Team.updateMembershipByTeamId(sectionEditorTeam.id, [])

    const curators = await TeamMember.query().where({
      teamId: curatorTeam.id,
    })

    const curatorIds = curators.map(member => member.userId)
    expect(curatorIds.length).toEqual(2)
    expect(curatorIds.includes(userOne.id)).toBeTruthy()
    expect(curatorIds.includes(userThree.id)).toBeTruthy()

    const sectionEditors = await TeamMember.query().where({
      teamId: sectionEditorTeam.id,
    })

    expect(sectionEditors.length).toEqual(0)
  })

  test('Teams , global and non-global, being related to ChatThreads ', async () => {
    const relatedObject = uuid()

    const createThread = async relatedObjectId =>
      ChatThread.query().insert({
        chatType: 'reviewer',
        relatedObjectId,
      })

    // the same relatedObject id on another chat thread should be ok
    const ctOne = await createThread(relatedObject)
    const ctTwo = await createThread(relatedObject)

    const threads = await ChatThread.query()
    expect(threads).toHaveLength(2)

    await Team.query().insert({
      role: nonGlobalTeams.EDITOR,
      objectId: ctOne.id,
      objectType: 'unknownObject',
      global: false,
    })

    await Team.query().insert({
      role: nonGlobalTeams.EDITOR,
      objectId: ctTwo.id,
      objectType: 'unknownObject',
      global: false,
    })

    // We should be able to link the different chat threads to two different teams
    const teams = await Team.query()
    expect(teams).toHaveLength(2)

    // a non-global team can't have the same chatThread associated with it with same role.

    await expect(
      Team.query().insert({
        role: nonGlobalTeams.EDITOR,
        objectId: ctTwo.id,
        objectType: 'unknownObject',
        global: false,
      }),
    ).rejects.toThrow()

    // same chatThread but different role works.
    await Team.query().insert({
      role: nonGlobalTeams.AUTHOR,
      objectId: ctTwo.id,
      objectType: 'unknownObject',
      global: false,
    })

    // We should be able to link the different chat threads to two different teams
    const teams2 = await Team.query()
    expect(teams2).toHaveLength(3)

    // and have a global team can't have a chatThread associated with it at all.

    await expect(
      Team.query().insert({
        role: globalTeams.AUTHOR,
        objectId: ctTwo.id,
        objectType: 'unknownObject',
        global: true,
      }),
    ).rejects.toThrow()
  })
})
