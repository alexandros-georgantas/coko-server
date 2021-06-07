const { v4: uuid } = require('uuid')

const { ChatThread, Team, TeamMember, User } = require('@pubsweet/models')
const { REVIEWER_STATUSES } = require('../../api/constants')
const clearDb = require('./_clearDb')

describe('Team Member Model', () => {
  beforeAll(() => clearDb())
  afterEach(() => clearDb())

  afterAll(() => {
    const knex = TeamMember.knex()
    knex.destroy()
  })

  test('can invite reviewer', async () => {
    const user = await User.query().insert({})

    const ct = await ChatThread.query().insert({
      chatType: 'reviewer',
      relatedObjectId: uuid(),
    })

    const team = await Team.query().insert({
      role: 'reviewer',
      objectId: ct.id,
      objectType: 'chatThread',
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

    const ct = await ChatThread.query().insert({
      chatType: 'reviewer',
      relatedObjectId: uuid(),
    })

    const team = await Team.query().insert({
      role: 'reviewer',
      objectId: ct.id,
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

    const ct = await ChatThread.query().insert({
      chatType: 'reviewer',
      relatedObjectId: uuid(),
    })

    const team = await Team.query().insert({
      role: 'reviewer',
      objectId: ct.id,
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
