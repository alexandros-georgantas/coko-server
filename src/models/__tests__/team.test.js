const { v4: uuid } = require('uuid')
const config = require('config')
const { Team, TeamMember, User } = require('../index')
const { createGlobalTeamWithUsers } = require('./helpers/teams')
const clearDb = require('./_clearDb')

const nonGlobalTeams = config.get('teams.nonGlobal')

describe('Team Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  it('cannot create a global team with object type and object id', async () => {
    await expect(
      Team.insert({
        role: 'author',
        displayName: 'Author',
        objectId: uuid(),
        objectType: 'someType',
        global: true,
      }),
    ).rejects.toThrow(
      /global_teams_must_not_have_associated_objects_other_teams_must_/,
    )
  })

  it('throws when displayName does not correspond to role', async () => {
    await expect(
      Team.insert({
        role: 'author',
        displayName: 'Editor',
        objectId: uuid(),
        objectType: 'someType',
        global: true,
      }),
    ).rejects.toThrow()
  })

  it('ensures global teams are unique', async () => {
    await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const createDuplicate = () =>
      Team.insert({
        role: 'editor',
        displayName: 'Editor',
        global: true,
      })

    await expect(createDuplicate()).rejects.toThrow()
  })

  it('ensures non-global teams are unique per object', async () => {
    const id = uuid()

    await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: id,
      objectType: 'unknownObject',
    })

    const second = await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: uuid(), // different object id
      objectType: 'unknownObject',
    })

    const createDuplicate = () =>
      Team.insert({
        role: 'author',
        displayName: 'Author',
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
        displayName: 'Author',
      })

    await expect(create()).rejects.toThrow()
  })

  it('ensures teams only accept valid roles', async () => {
    const createTeam = () =>
      Team.insert({
        role: 'lorem ipsum',
        displayName: 'Lorem',
      })

    await expect(createTeam()).rejects.toThrow()
  })

  it('ensures global teams should only accept global roles', async () => {
    const createValid = () =>
      Team.insert({
        role: 'editor',
        displayName: 'Editor',
        global: true,
      })

    const createInvalid = () =>
      Team.insert({
        role: 'non-global-role',
        displayName: 'Lorem',
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
        displayName: 'Author',
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    const createInvalid = () =>
      Team.insert({
        role: 'global-role',
        displayName: 'Lorem',
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
        displayName: 'Editor',
        global: true,
      },
      {
        role: 'author',
        displayName: 'Author',
        global: true,
      },
    ])

    const teams = await Team.findAllGlobalTeams()
    expect(teams.length).toEqual(2)

    const editorTeam = teams.find(t => t.role === 'editor')
    expect(editorTeam).toBeDefined()
    expect(editorTeam.global).toBeTruthy()

    const authorTeam = teams.find(t => t.role === 'author')
    expect(authorTeam).toBeDefined()
    expect(authorTeam.global).toBeTruthy()
  })

  it('finds global teams by role', async () => {
    await Team.insert({
      role: 'editor',
      displayName: 'Editor',
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

    const EDITOR_ROLE = 'editor'

    await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId,
      objectType,
    })

    await Team.insert({
      role: EDITOR_ROLE,
      displayName: 'Editor',
      objectId,
      objectType,
    })

    const authorTeam = await Team.findTeamByRoleAndObject('author', objectId)

    expect(authorTeam).toBeDefined()
    expect(authorTeam.role).toEqual('author')
    expect(authorTeam.global).toBeFalsy()

    const editorTeam = await Team.findTeamByRoleAndObject(EDITOR_ROLE, objectId)

    expect(editorTeam).toBeDefined()
    expect(editorTeam.role).toEqual(EDITOR_ROLE)
    expect(editorTeam.global).toBeFalsy()
  })

  it('adds member to team', async () => {
    const team = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
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

  it('removes a team member from a team', async () => {
    const { user, team } = await createGlobalTeamWithUsers()
    await Team.removeMember(team.id, user.id)

    const teamWithMembers = await Team.query()
      .findById(team.id)
      .withGraphFetched('members')

    expect(teamWithMembers.members).toHaveLength(0)
  })

  it('fetches team members', async () => {
    const { user, team } = await createGlobalTeamWithUsers()

    const teamWithMembers = await Team.query()
      .findById(team.id)
      .withGraphFetched('members')

    expect(teamWithMembers.members).toHaveLength(1)
    expect(teamWithMembers.members[0].userId).toEqual(user.id)
  })

  it('fetches team users', async () => {
    const { user, team } = await createGlobalTeamWithUsers()

    const teamWithMembers = await Team.query()
      .findById(team.id)
      .withGraphFetched('users')

    expect(teamWithMembers.users).toHaveLength(1)
    expect(teamWithMembers.users[0].id).toEqual(user.id)
  })

  it('updates team membership given an array of user ids', async () => {
    const userOne = await User.insert({})
    const userTwo = await User.insert({})
    const userThree = await User.insert({})

    const editorTeam = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const authorTeam = await Team.insert({
      role: 'author',
      displayName: 'Author',
      global: true,
    })

    await TeamMember.query().insert([
      {
        teamId: editorTeam.id,
        userId: userOne.id,
      },
      {
        teamId: authorTeam.id,
        userId: userTwo.id,
      },
    ])

    await Team.updateMembershipByTeamId(editorTeam.id, [
      userOne.id,
      userThree.id,
    ])

    await Team.updateMembershipByTeamId(authorTeam.id, [])

    const editors = await TeamMember.query().where({
      teamId: editorTeam.id,
    })

    const editorIds = editors.map(member => member.userId)
    expect(editorIds.length).toEqual(2)
    expect(editorIds.includes(userOne.id)).toBeTruthy()
    expect(editorIds.includes(userThree.id)).toBeTruthy()

    const authors = await TeamMember.query().where({
      teamId: authorTeam.id,
    })

    expect(authors.length).toEqual(0)
  })

  it('has updated set when created', async () => {
    const team = await Team.insert({
      role: nonGlobalTeams.author.role,
      displayName: 'Author',
      global: true,
    })

    expect(team.role).toEqual(nonGlobalTeams.author.role)
    const now = new Date().toISOString()
    expect(team.updated).toHaveLength(now.length)
  })

  it('deletes memberships after team is deleted', async () => {
    const { team, user } = await createGlobalTeamWithUsers()

    let foundUser = await User.query()
      .findById(user.id)
      .withGraphFetched('teams')

    expect(foundUser.teams).toHaveLength(1)

    await Team.query().deleteById(team.id)

    foundUser = await User.query().findById(user.id).withGraphFetched('teams')

    expect(foundUser.teams).toHaveLength(0)
  })
})
