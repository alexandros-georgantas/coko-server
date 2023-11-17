const { internet } = require('faker')
const { Identity } = require('../index')

const { createUser } = require('./helpers/users')
const { identityWithProfileData } = require('./fixtures/identities')

const clearDb = require('./_clearDb')

describe('Identity model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Identity.knex()
    knex.destroy()
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

    const { result: identities } = await Identity.find({ userId: user.id })
    expect(identities.length).toEqual(2)
  })

  it('cannot create identity without an email', async () => {
    const user = await createUser()

    await expect(
      Identity.insert({
        userId: user.id,
      }),
    ).rejects.toThrow()
  })

  it('cannot create identity without a userId', async () => {
    await expect(
      Identity.insert({
        email: internet.email(),
      }),
    ).rejects.toThrow()
  })

  it('cannot have multiple default identities for the same user', async () => {
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

  it('fetches user info of an identity', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      email: internet.email(),
      isDefault: true,
    })

    const identityUser = await Identity.findById(identity.id, {
      related: 'user',
    })

    expect(identityUser.user.surname).toEqual(user.surname)
  })

  it('creates a user identity with profile data', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      ...identityWithProfileData,
    })

    const identityUser = await Identity.findById(identity.id)

    expect(identityUser.profileData.displayName).toEqual(
      identityWithProfileData.profileData.displayName,
    )
  })

  it('creates two identities with the same email but different provider', async () => {
    const user = await createUser()

    const createIdentity = async provider => {
      return Identity.insert({
        userId: user.id,
        email: 'john@example.com',
        provider,
      })
    }

    // first time should be fine
    const id1 = await createIdentity('test1')
    const id2 = await createIdentity('test2')

    expect(id1.email).toEqual(id2.email)
    expect(id1.provider).not.toEqual(id2.provider)
  })

  it('fails when creating two identities with the same email and provider', async () => {
    const user = await createUser()

    const createIdentity = async () => {
      await Identity.insert({
        userId: user.id,
        email: 'john@example.com',
        provider: 'test',
      })
    }

    // first time should be fine
    await createIdentity()

    // second time should throw an error
    await expect(createIdentity).rejects.toThrow(/unique_provider_email/)
  })
})
