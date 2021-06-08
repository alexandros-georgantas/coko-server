const {
  Team,
  TeamMember,
  Identity
} = require('@pubsweet/models')

const { createUsers } = require('../_helpers/createUsers')

const clearDb = require('./_clearDb')

const { REVIEWER_STATUSES } = require('../../api/constants')

describe('Identitty Model', () => {
  beforeAll(() => clearDb())
  afterEach(() => clearDb())

  afterAll(() => {
    const knex = Identity.knex()
    knex.destroy()
  })

  test('Create multiple users and associated identities', async () => {
    const users = await createUsers(4)
       
   expect(users).toHaveLength(4)

  })
})
