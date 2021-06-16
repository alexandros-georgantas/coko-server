const { Identity, User } = require('..')

const { createUsers, createUser } = require('../_helpers/createUsers')

const clearDb = require('./_clearDb')

describe('Identitty Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Identity.knex()
    knex.destroy()
  })

  test('Create multiple users and associated identities', async () => {
    const users = await createUsers(4)

    expect(users).toHaveLength(4)
  })

  /*
  FIXME :: make this test delete the identity manually

  test('Create a user, delete its identities', async () => {
    const { user } = await createUser()

    const numIds = await user.deleteIdentities()

    const ids = await Identity.query().where({
      userId: user.id,
    })

    expect(ids).toHaveLength(0)
    expect(numIds === 1).toBeTruthy()
  })
  */

  test('Cant find user by email from User object ', async () => {
    const user = await createUser()

    // This API on coko server User object should NOT work.
    const ids = User.findByEmail(user.email)

    expect(ids).toBeUndefined()
  })

  test('find user by email from Identity object ', async () => {
    const { user, id } = await createUser()
    // Find the identity object

    const ids = await Identity.query().where({
      email: id.email.toLowerCase(),
    })

    expect(ids).toHaveLength(1)
    expect(user.id === ids[0].userId).toBeTruthy()
  })
})
