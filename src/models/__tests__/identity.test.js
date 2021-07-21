const { internet } = require('faker')
const { Identity } = require('..')

const { createUser } = require('./helpers/users')
const { identityWithProfileData } = require('./fixtures/identities')

const clearDb = require('./_clearDb')

describe('Identity model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Identity.knex()
    knex.destroy()
  })

  it('creates an identity', async () => {
    const user = await createUser()

    const userIdentity = await Identity.insert({
      userId: user.id,
      email: internet.email(),
      isVerified: false,
    })

    expect(userIdentity.userId).toEqual(user.id)
  })

  it('creates multiple identities for the same user', async () => {
    const user = await createUser()

    await Identity.insert({
      userId: user.id,
      email: internet.email(),
      isVerified: false,
    })

    await Identity.insert({
      userId: user.id,
      email: internet.email(),
      isVerified: false,
    })

    const identities = await Identity.query().where({ userId: user.id })
    expect(identities.length).toEqual(2)
  })

  it('patches identity', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      email: internet.email(),
    })

    await Identity.patch({ isVerified: true })
    const patchedIdentity = await Identity.findById(identity.id)
    expect(patchedIdentity.isVerified).toEqual(true)
  })

  it('deletes identity', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      email: internet.email(),
    })

    const affectedRows = await Identity.deleteById(identity.id)
    const identities = await Identity.query()
    expect(affectedRows).toEqual(1)
    expect(identities).toHaveLength(0)
  })

  it('cannot create identity without an email ', async () => {
    const user = await createUser()

    await expect(
      Identity.insert({
        userId: user.id,
      }),
    ).rejects.toThrow()
  })

  it('cannot create identity without a userId ', async () => {
    await expect(
      Identity.insert({
        email: internet.email(),
      }),
    ).rejects.toThrow()
  })

  it('cannot have multiple default identities fro the same user ', async () => {
    const user = await createUser()

    await Identity.insert({
      userId: user.id,
      email: internet.email(),
      isDefault: true,
    })

    await expect(
      Identity.insert({
        userId: user.id,
        email: internet.email(),
        isDefault: true,
      }),
    ).rejects.toThrow()
  })

  it('fetches user info of an identity ', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      email: internet.email(),
      isDefault: true,
    })

    const identityUser = await Identity.query()
      .findById(identity.id)
      .withGraphFetched('user')

    expect(identityUser.user.surname).toEqual(user.surname)
  })

  it('creates a user identity with profile data', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      ...identityWithProfileData,
    })

    const identityUser = await Identity.query().findById(identity.id)

    expect(identityUser.profileData.displayName).toEqual(
      identityWithProfileData.profileData.displayName,
    )
  })
})
