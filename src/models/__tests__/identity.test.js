const { Identity, User } = require('..')

const {
  createUsersAndIdentities,
  createUserAndIdentity,
} = require('../_helpers/createUsers')

const clearDb = require('./_clearDb')
const fixtures = require('./fixtures')

describe('Identitty Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Identity.knex()
    knex.destroy()
  })

  test('Create multiple users and associated identities', async () => {
    const users = await createUsersAndIdentities(4)

    expect(users).toHaveLength(4)
  })

  test('cant have more than one default identity', async () => {
    const users = await createUsersAndIdentities(1)

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
    const { user } = await createUserAndIdentity()

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
    const user = await createUserAndIdentity()

    // This API on coko server User object should NOT work.
    const ids = User.findByEmail(user.email)

    expect(ids).toBeUndefined()
  })

  test('Can find user by email from Identity object ', async () => {
    const { user, id } = await createUserAndIdentity()
    // Find the identity object

    const ids = await Identity.query().where({
      email: id.email.toLowerCase(),
    })

    expect(ids).toHaveLength(1)
    expect(user.id === ids[0].userId).toBeTruthy()
  })

  it('can create a user with a default local identity', async () => {
    const user = await User.query().insert({ ...fixtures.user })

    const defaultIdentity = await Identity.query().insert({
      ...fixtures.localIdentity,
      userId: user.id,
      isDefault: true,
      isConfirmed: true,
    })

    const savedUser = await User.find(user.id, { eager: 'defaultIdentity' })

    expect(savedUser.defaultIdentity.id).toEqual(defaultIdentity.id)
    expect(savedUser.defaultIdentity.userId).toEqual(defaultIdentity.userId)
    expect(savedUser.defaultIdentity.isDefault).toBeTruthy()
    expect(savedUser.defaultIdentity.name).toEqual(defaultIdentity.name)
  })

  it('can create a user with a local and a default oauth identity', async () => {
    let user = await User.query().insert({ ...fixtures.user })

    const localIdentity = await Identity.query().insert({
      ...fixtures.localIdentity,
      userId: user.id,
      isConfirmed: true,
    })

    const externalIdentity = await Identity.query().insert({
      ...fixtures.externalIdentity,
      userId: user.id,
      isDefault: true,
      isConfirmed: true,
    })

    // user = await User.find(user.id, { eager: '[identities, defaultIdentity]' })

    user = await User.query()
      .findOne({ id: user.id })
      .withGraphFetched('[identities, defaultIdentity]')

    expect(user.identities).toHaveLength(2)
    expect(user.identities[0].id).toEqual(localIdentity.id)
    expect(user.identities[0].aff).toEqual(localIdentity.aff)
    expect(user.identities[0].name).toEqual(localIdentity.name)
    expect(user.identities[0].email).toEqual(localIdentity.email)
    expect(user.identities[0].isDefault).toEqual(localIdentity.isDefault)

    expect(user.identities[1].id).toEqual(externalIdentity.id)
    expect(user.identities[1].aff).toEqual(externalIdentity.aff)
    expect(user.identities[1].name).toEqual(externalIdentity.name)
    expect(user.identities[1].email).toEqual(externalIdentity.email)
    expect(user.identities[1].isDefault).toEqual(externalIdentity.isDefault)

    expect(user.defaultIdentity.id).toEqual(externalIdentity.id)
    expect(user.defaultIdentity.aff).toEqual(externalIdentity.aff)
    expect(user.defaultIdentity.name).toEqual(externalIdentity.name)
    expect(user.defaultIdentity.email).toEqual(externalIdentity.email)
    expect(user.defaultIdentity.isDefault).toEqual(externalIdentity.isDefault)
  })

  it('user can not have more than one default identities', async () => {
    const user = await User.query().insert({ ...fixtures.user })

    await Identity.query().insert({
      ...fixtures.localIdentity,
      userId: user.id,
      isDefault: true,
      isConfirmed: true,
    })

    const externalIdentity = Identity.query().insert({
      ...fixtures.externalIdentity,
      userId: user.id,
      isDefault: true,
      isConfirmed: true,
    })

    await expect(externalIdentity).rejects.toThrow('violates unique constraint')
  })

  it('can have multiple non-default identities (isDefault = false)', async () => {
    const user = await User.query().insert({ ...fixtures.user })

    await Identity.query().insert({
      ...fixtures.localIdentity,
      userId: user.id,
      isDefault: false,
      isConfirmed: true,
    })

    await Identity.query().insert({
      ...fixtures.externalIdentity,
      userId: user.id,
      isDefault: false,
      isConfirmed: true,
    })

    const foundUser = await User.find(user.id, { eager: 'identities' })
    expect(foundUser.identities).toHaveLength(2)
  })
})
