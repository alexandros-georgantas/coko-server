const activityLog = require('../activityLog')

const Fake = require('../../models/__tests__/helpers/fake/fake.model')
const { createUser } = require('../../models/__tests__/helpers/users')
const clearDb = require('../../models/__tests__/_clearDb')
const ActivityLog = require('../../models/activityLog/activityLog.model')
const { actionTypes } = require('../../models/activityLog/constants')

describe('Activity Log Service', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Fake.knex()
    knex.destroy()
  })

  it('creates a log entry', async () => {
    const actor = await createUser()
    const dummyUser = await createUser()

    const log = await activityLog({
      actorId: actor.id,
      actionType: actionTypes.CREATE,
      message: 'create a new user',
      valueAfter: dummyUser,
      affectedObjects: [{ id: dummyUser.id, objectType: 'user' }],
    })

    const { result: activities } = await ActivityLog.find({})
    expect(log).toBeDefined()
    expect(activities).toHaveLength(1)
  })
})
