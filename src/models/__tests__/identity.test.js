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

  test('cant have more than one default identity', async () => {
    const users = await createUsers(1)

    expect(users).toHaveLength(1)

    const makeNewId = defaultish =>
      Identity.query().insert({
        userId: users[0].user.id,
        email: 'a@b.org',
        isConfirmed: true,
        isDefault: defaultish,
      })

    await expect(makeNewId(true)).rejects.toThrow()

    await expect(makeNewId(false)).toBeDefined()
  })

  test('Create a user, delete its identities', async () => {
    const { user } = await createUser()

    // delete the associated Identities.
    const numIds = await Identity.query()
      .where({
        userId: user.id,
      })
      .delete()

    const ids = await Identity.query().where({
      userId: user.id,
    })

    // Should have gotten back that no Identities for that user are available.
    expect(ids).toHaveLength(0)
    // Should have gotten back that ONE identity was deleted.
    expect(numIds === 1).toBeTruthy()
  })

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
