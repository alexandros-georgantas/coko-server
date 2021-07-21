const { v4: uuid } = require('uuid')
const config = require('config')
const { Team, TeamMember, User } = require('../index')
const { createTeamWithUsers } = require('./helpers/teams')
const clearDb = require('./_clearDb')

const nonGlobalTeams = config.get('teams.nonglobal')

describe('Team Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  it('creates a local team with object type and object id', async () => {
    const team = await Team.insert({
      role: 'author',
      objectId: uuid(),
      objectType: 'someType',
    })

    expect(team).toBeDefined()
    expect(team.role).toEqual('author')
  })

  it('cannot create a global team with object type and object id', async () => {
    await expect(
      Team.insert({
        role: 'author',
        objectId: uuid(),
        objectType: 'someType',
        global: true,
      }),
    ).rejects.toThrow(
      /global_teams_must_not_have_associated_objects_other_teams_must_/,
    )
  })

  it('creates a new global team', async () => {
    const team = await Team.insert({
      role: 'editor',
      global: true,
    })

    expect(team).toBeDefined()
    expect(team.global).toBeTruthy()
  })

  it('ensures global teams are unique', async () => {
    await Team.insert({
      role: 'editor',
      global: true,
    })

    const createDuplicate = () =>
      Team.insert({
        role: 'editor',
        global: true,
      })

    await expect(createDuplicate()).rejects.toThrow()
  })

  it('ensures non-global teams are unique per object', async () => {
    const id = uuid()

    await Team.insert({
      role: 'author',
      objectId: id,
      objectType: 'unknownObject',
    })

    const second = await Team.insert({
      role: 'author',
      objectId: uuid(), // different object id
      objectType: 'unknownObject',
    })

    const createDuplicate = () =>
      Team.insert({
        role: 'author',
        objectId: id, // same object id
        objectType: 'unknownObject',
      })

    expect(second).toBeDefined()
    await expect(createDuplicate()).rejects.toThrow()
  })

  it('ensures non-global teams must have an associated object', async () => {
    const create = () =>
      Team.query().insert({
        role: 'author',
      })

    await expect(create()).rejects.toThrow()
  })

  it('ensures only accepts valid roles', async () => {
    const createTeam = () =>
      Team.insert({
        role: 'lorem ipsum',
      })

    await expect(createTeam()).rejects.toThrow()
  })

  it('ensures global teams should only accept global roles', async () => {
    const createValid = () =>
      Team.insert({
        role: 'editor',
        global: true,
      })

    const createInvalid = () =>
      Team.insert({
        role: 'non-global-role',
        global: true,
      })

    const globalTeam = await createValid()
    expect(globalTeam.id).toBeDefined()
    await expect(createInvalid()).rejects.toThrow()
  })

  it('ensures non-global teams should only accept non-global roles', async () => {
    const createValid = () =>
      Team.insert({
        role: 'author',
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    const createInvalid = () =>
      Team.insert({
        role: 'global-role',
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    const validTeam = await createValid()
    expect(validTeam.id).toBeDefined()
    await expect(createInvalid()).rejects.toThrow()
  })

  it('finds all global teams', async () => {
    await Team.insert([
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

  it('finds global teams by role', async () => {
    await Team.insert({
      role: 'editor',
      global: true,
    })

    const res = await Team.findGlobalTeamByRole('editor')

    expect(res).toBeDefined()
    expect(res.role).toEqual('editor')
    expect(res.global).toBeTruthy()
  })

  it('finds teams by role and object', async () => {
    const objectId = uuid()
    const objectType = 'lorem'

    const REVIEWER_ROLE = 'editor'

    await Team.insert({
      role: 'author',
      objectId,
      objectType,
    })

    await Team.insert({
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

  it('adds member to team', async () => {
    const team = await Team.insert({
      role: 'editor',
      global: true,
    })

    const user = await User.insert({})

    await Team.addMember(team.id, user.id)

    const member = await TeamMember.findOne({
      teamId: team.id,
      userId: user.id,
    })

    expect(member).toBeDefined()
  })
  it('removes team members from a team', async () => {
    const { user, team } = await createTeamWithUsers()
    await Team.removeMember(team.id, user.id)

    const teamWithMembers = await Team.query()
      .findById(team.id)
      .withGraphFetched('members')

    expect(teamWithMembers.members).toHaveLength(0)
  })

  it('fetches team members', async () => {
    const { user, team } = await createTeamWithUsers()

    const teamWithMembers = await Team.query()
      .findById(team.id)
      .withGraphFetched('members')

    expect(teamWithMembers.members).toHaveLength(1)
    expect(teamWithMembers.members[0].userId).toEqual(user.id)
  })

  it('fetches team users', async () => {
    const { user, team } = await createTeamWithUsers()

    const teamWithMembers = await Team.query()
      .findById(team.id)
      .withGraphFetched('users')

    expect(teamWithMembers.users).toHaveLength(1)
    expect(teamWithMembers.users[0].id).toEqual(user.id)
  })

  //   /**
  //    * Logic here is as follows:
  //    * - create two users
  //    * - make them both global curators
  //    * - make them each a curator on a different chat thread
  //    * - remove the first user from the global team
  //    * - first user should automatically be removed from the non-global team as well
  //    */
  //   test('removes member from team', async () => {
  //     const users = await User.query().insert([{}, {}])

  //     const globalCurators = await Team.query().insert({
  //       role: 'editor',
  //       global: true,
  //     })

  //     await TeamMember.query().insert(
  //       users.map(user => ({
  //         teamId: globalCurators.id,
  //         userId: user.id,
  //       })),
  //     )

  //     const chatTeams = []

  //     await Promise.all(
  //       [0, 1].map(async index => {
  //         const ct = await ChatThread.query().insert({
  //           chatType: 'reviewer',
  //           relatedObjectId: uuid(),
  //         })

  //         const team = await Team.query().insert({
  //           role: 'editor',
  //           objectId: ct.id,
  //           objectType: 'chatthread',
  //           global: false,
  //         })

  //         chatTeams.push(team)

  //         await TeamMember.query().insert({
  //           teamId: team.id,
  //           userId: users[index].id,
  //         })
  //       }),
  //     )

  //     // Remove the first user from the global Team
  //     await Team.removeMember(globalCurators.id, users[0].id)

  //     const globalCuratorMembers = await TeamMember.query().where({
  //       teamId: globalCurators.id,
  //     })

  //     expect(globalCuratorMembers.length).toEqual(1)
  //     expect(globalCuratorMembers[0].userId).toEqual(users[1].id)

  //     // Rmove the first user from the first non global team
  //     await Team.removeMember(chatTeams[0].id, users[0].id)

  //     const membersOfChatOne = await TeamMember.query().where({
  //       teamId: chatTeams[0].id,
  //     })

  //     expect(membersOfChatOne.length).toEqual(0)

  //     const membersOfChatTwo = await TeamMember.query().where({
  //       teamId: chatTeams[1].id,
  //     })

  //     expect(membersOfChatTwo.length).toEqual(1)
  //     expect(membersOfChatTwo[0].userId).toEqual(users[1].id)
  //   })

  it('updates team membership given an array of user ids', async () => {
    const userOne = await User.insert({})
    const userTwo = await User.insert({})
    const userThree = await User.insert({})

    const curatorTeam = await Team.insert({
      role: 'editor',
      global: true,
    })

    const sectionEditorTeam = await Team.insert({
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

  //   test('global and non-global teams can be related to ChatThreads ', async () => {
  //     const relatedObject = uuid()

  //     const createThread = async relatedObjectId =>
  //       ChatThread.query().insert({
  //         chatType: 'reviewer',
  //         relatedObjectId,
  //       })

  //     // the same relatedObject id on another chat thread should be ok
  //     const ctOne = await createThread(relatedObject)
  //     const ctTwo = await createThread(relatedObject)

  //     const threads = await ChatThread.query()
  //     expect(threads).toHaveLength(2)

  //     await Team.query().insert({
  //       role: nonGlobalTeams.EDITOR,
  //       objectId: ctOne.id,
  //       objectType: 'unknownObject',
  //       global: false,
  //     })

  //     await Team.query().insert({
  //       role: nonGlobalTeams.EDITOR,
  //       objectId: ctTwo.id,
  //       objectType: 'unknownObject',
  //       global: false,
  //     })

  //     // We should be able to link the different chat threads to two different teams
  //     const teams = await Team.query()
  //     expect(teams).toHaveLength(2)

  //     // a non-global team can't have the same chatThread associated with it with same role.

  //     await expect(
  //       Team.query().insert({
  //         role: nonGlobalTeams.EDITOR,
  //         objectId: ctTwo.id,
  //         objectType: 'unknownObject',
  //         global: false,
  //       }),
  //     ).rejects.toThrow()

  //     // same chatThread but different role works.
  //     await Team.query().insert({
  //       role: nonGlobalTeams.AUTHOR,
  //       objectId: ctTwo.id,
  //       objectType: 'unknownObject',
  //       global: false,
  //     })

  //     // We should be able to link the different chat threads to two different teams
  //     const teams2 = await Team.query()
  //     expect(teams2).toHaveLength(3)

  //     // and have a global team can't have a chatThread associated with it at all.

  //     await expect(
  //       Team.query().insert({
  //         role: globalTeams.AUTHOR,
  //         objectId: ctTwo.id,
  //         objectType: 'unknownObject',
  //         global: true,
  //       }),
  //     ).rejects.toThrow()
  //   })

  it('has updated set when created', async () => {
    const team = await Team.insert({
      name: 'Test',
      role: nonGlobalTeams.AUTHOR,
      global: true,
    })

    expect(team.role).toEqual(nonGlobalTeams.AUTHOR)
    const now = new Date().toISOString()
    expect(team.updated).toHaveLength(now.length)
  })

  it('deletes memberships after team is deleted', async () => {
    const { team, user } = await createTeamWithUsers()

    let foundUser = await User.query()
      .findById(user.id)
      .withGraphFetched('teams')

    expect(foundUser.teams).toHaveLength(1)

    await Team.query().deleteById(team.id)

    foundUser = await User.query().findById(user.id).withGraphFetched('teams')

    expect(foundUser.teams).toHaveLength(0)
  })

  it('creates team and related objects with one call', async () => {
    const user = await User.query().insert({
      password: 'some@example.com',
      username: 'test',
    })

    const team = await Team.query().upsertGraphAndFetch(
      {
        role: nonGlobalTeams.EDITOR,
        name: 'My team',
        global: false,
        objectId: '5989b23c-356b-4ae9-bee5-bbd11f29028b',
        objectType: 'fragment',
        members: [
          {
            user: { id: user.id },
          },
        ],
      },
      {
        relate: true,
        unrelate: true,
      },
    )

    expect(team.members).toHaveLength(1)
    expect(team.members[0].id).toBeDefined()
    expect(team.members[0].user.id).toBe(user.id)

    const userWithTeams = await User.query()
      .findById(user.id)
      .withGraphFetched('teams')

    expect(userWithTeams.teams[0].id).toBe(team.id)
  })
})
