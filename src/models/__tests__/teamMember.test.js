const { ChatThread, Team, TeamMember, User } = require('@pubsweet/models')

const { TEAMS: ROLES, REVIEWER_STATUSES } = require('../../api/constants')
const clearDb = require('./_clearDb')

const expectManuscriptsToBeTiedToRole = async role => {
  const { user, manuscript } = await insertNewUserWithRole(role)
  const manuscriptIds = await TeamMember.manuscriptIdsWithRole(role, user.id)

  expect(manuscriptIds).toContain(manuscript.id)
}

const insertNewUserWithRole = async role => {
  const user = await User.query().insert({})

  const manuscriptTeam = await Team.query().insert({
    role,
    objectId: manuscript.id,
    objectType: 'article',
  })

  await Team.addMember(manuscriptTeam.id, user.id)
  return { user, manuscript }
}

describe('Team Member Model', () => {
  beforeAll(() => clearDb())
  afterEach(() => clearDb())

  afterAll(() => {
    const knex = TeamMember.knex()
    knex.destroy()
  })

  test('should return manuscript ids where user is author', async () => {
    const role = ROLES.AUTHOR
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})

    const manuscriptVersion = await ManuscriptVersion.query().insert({
      manuscriptId: manuscript.id,
    })

    const manuscriptTeam = await Team.query().insert({
      role,
      objectId: manuscriptVersion.id,
      objectType: 'manuscriptVersion',
    })

    await Team.addMember(manuscriptTeam.id, user.id)
    const manuscriptIds = await TeamMember.manuscriptIdsWithRole(role, user.id)

    expect(manuscriptIds).toContain(manuscript.id)
  })

  test('should return manuscript ids and manuscript version ids where user is reviewer', async () => {
    const role = ROLES.REVIEWER
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})

    const manuscriptVersion = await ManuscriptVersion.query().insert({
      manuscriptId: manuscript.id,
    })

    const manuscriptTeam = await Team.query().insert({
      role,
      objectId: manuscriptVersion.id,
      objectType: 'manuscriptVersion',
    })

    await Team.addMember(manuscriptTeam.id, user.id, {
      status: REVIEWER_STATUSES.accepted,
    })

    const manuscriptVersionIds = await TeamMember.manuscriptVersionIdsWithRole(
      role,
      user.id,
      REVIEWER_STATUSES.accepted,
    )

    const manuscriptIds = await TeamMember.manuscriptIdsWithRole(role, user.id)

    expect(manuscriptIds).toContain(manuscript.id)

    expect(manuscriptIds).toContain(manuscript.id)
    expect(manuscriptVersionIds).toContain(manuscriptVersion.id)
  })

  /* eslint-disable-next-line jest/expect-expect */
  test('should return manuscript ids where user is editor', async () => {
    await expectManuscriptsToBeTiedToRole(ROLES.EDITOR)
  })

  /* eslint-disable-next-line jest/expect-expect */
  test('should return manuscript ids where user is science officer', async () => {
    await expectManuscriptsToBeTiedToRole(ROLES.SCIENCE_OFFICER)
  })

  /* eslint-disable-next-line jest/expect-expect */
  test('should return manuscript ids where user is section editor', async () => {
    await expectManuscriptsToBeTiedToRole(ROLES.SCIENCE_OFFICER)
  })

  /* eslint-disable-next-line jest/expect-expect */
  test('should return manuscript ids where user is curator', async () => {
    await expectManuscriptsToBeTiedToRole(ROLES.CURATOR)
  })

  test('should throw an error if no valid role is provided', async () => {
    await expect(
      TeamMember.manuscriptIdsWithRole('invalid-role', 1),
    ).rejects.toThrow(new Error('No valid role provided'))
  })

  test('adds a curator review when a curator is added', async () => {
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})

    const version = await ManuscriptVersion.query().insert({
      manuscriptId: manuscript.id,
    })

    const curatorTeam = await Team.query().insert({
      role: 'curator',
      objectId: manuscript.id,
      objectType: 'article',
    })

    await Team.addMember(curatorTeam.id, user.id)

    const curatorTeamMember = await TeamMember.query()
      .leftJoin('teams', 'team_members.team_id', 'teams.id')
      .findOne({
        role: 'curator',
        objectId: manuscript.id,
        userId: user.id,
      })

    expect(curatorTeamMember.userId).toEqual(user.id)

    const curatorReview = await CuratorReview.query().findOne({
      curatorId: user.id,
    })

    expect(curatorReview.manuscriptVersionId).toEqual(version.id)
  })

  test('does not add a curator member if curator review addition fails', async () => {
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})
    // Not creating a version will make addMember's afterInsert fail

    const curatorTeam = await Team.query().insert({
      role: 'curator',
      objectId: manuscript.id,
      objectType: 'article',
    })

    const addCurator = () => Team.addMember(curatorTeam.id, user.id)
    await expect(addCurator()).rejects.toThrow()

    const curatorTeamMember = await TeamMember.query()
      .leftJoin('teams', 'team_members.team_id', 'teams.id')
      .findOne({
        role: 'curator',
        objectId: manuscript.id,
        userId: user.id,
      })

    expect(curatorTeamMember).not.toBeDefined()

    const curatorReview = await CuratorReview.query().findOne({
      curatorId: user.id,
    })

    expect(curatorReview).not.toBeDefined()
  })

  test('adds a chat thread when a curator is assigned to a manuscript', async () => {
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})
    await ManuscriptVersion.query().insert({
      manuscriptId: manuscript.id,
    })

    const team = await Team.query().insert({
      objectId: manuscript.id,
      objectType: 'article',
      role: 'curator',
    })

    await Team.addMember(team.id, user.id)

    const thread = await ChatThread.query().findOne({
      manuscriptId: manuscript.id,
      userId: user.id,
      chatType: 'curator',
    })

    expect(thread.userId).toEqual(user.id)
    expect(thread.chatType).toEqual('curator')
    expect(thread.manuscriptId).toEqual(manuscript.id)
  })

  test('can invite reviewer', async () => {
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})

    const version = await ManuscriptVersion.query().insert({
      manuscriptId: manuscript.id,
    })

    const team = await Team.query().insert({
      role: 'reviewer',
      objectId: version.id,
      objectType: 'manuscriptVersion',
    })

    const member = await TeamMember.query().insert({
      userId: user.id,
      teamId: team.id,
    })

    expect(member.canInvite()).toEqual(true)

    await member.$query().patch({
      status: REVIEWER_STATUSES.invited,
    })

    expect(member.canInvite()).toEqual(false)

    await member.$query().patch({
      status: REVIEWER_STATUSES.revoked,
    })

    expect(member.canInvite()).toEqual(false)
  })

  test('has reviewer been invited', async () => {
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})

    const version = await ManuscriptVersion.query().insert({
      manuscriptId: manuscript.id,
    })

    const team = await Team.query().insert({
      role: 'reviewer',
      objectId: version.id,
      objectType: 'manuscriptVersion',
    })

    const member = await TeamMember.query().insert({
      userId: user.id,
      teamId: team.id,
    })

    expect(member.hasBeenInvited()).toEqual(false)

    await member.$query().patch({
      status: REVIEWER_STATUSES.invited,
    })

    expect(member.hasBeenInvited()).toEqual(true)

    await member.$query().patch({
      status: REVIEWER_STATUSES.revoked,
    })

    expect(member.hasBeenInvited()).toEqual(true)
  })

  test('does reviewer have active invitation', async () => {
    const user = await User.query().insert({})
    const manuscript = await Manuscript.query().insert({})

    const version = await ManuscriptVersion.query().insert({
      manuscriptId: manuscript.id,
    })

    const team = await Team.query().insert({
      role: 'reviewer',
      objectId: version.id,
      objectType: 'manuscriptVersion',
    })

    const member = await TeamMember.query().insert({
      userId: user.id,
      teamId: team.id,
    })

    expect(member.hasActiveInvitation()).toEqual(false)

    await member.$query().patch({
      status: REVIEWER_STATUSES.invited,
    })

    expect(member.hasActiveInvitation()).toEqual(true)

    await member.$query().patch({
      status: REVIEWER_STATUSES.revoked,
    })

    expect(member.hasActiveInvitation()).toEqual(false)
  })
})
