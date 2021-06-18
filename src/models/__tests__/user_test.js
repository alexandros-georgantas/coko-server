const clearDb = require('./_clearDb')
const fixtures = require('./fixtures')
const { User } = require('../index')

describe('User', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = User.knex()
    knex.destroy()
  })

  it('validates passwords correctly after saving to db', async () => {
    const user = await User.query().insert({ ...fixtures.user })

    const savedUser = await User.findByUsername(user.username)

    expect(typeof savedUser).toBe('object')

    const shouldBeValid = await savedUser.validPassword(fixtures.user.password)
    expect(shouldBeValid).toEqual(true)

    const shouldBeInvalid = await savedUser.validPassword('wrongpassword')
    expect(shouldBeInvalid).toEqual(false)
  })

  it('raises an error if trying to save a user with a non-unique username', async () => {
    await User.query().insert({ ...fixtures.user })
    const otherUserFixture = fixtures.otherUser
    otherUserFixture.username = fixtures.user.username

    const insertOtherUser = () =>
      User.query().insert({
        ...otherUserFixture,
      })

    await expect(insertOtherUser()).rejects.toThrow()
  })

  it('raises an error if trying to save a user with a non-unique email', async () => {
    await User.query().insert({ ...fixtures.user })
    const otherUserFixture = fixtures.otherUser
    otherUserFixture.email = fixtures.user.email

    const insertOtherUser = () =>
      User.query().insert({
        ...otherUserFixture,
      })

    await expect(insertOtherUser()).rejects.toThrow()
  })

  it('uses custom JSON serialization', async () => {
    const user = await User.query().insert({ ...fixtures.user })

    const savedUser = await User.findByUsername(user.username)
    expect(savedUser).toHaveProperty('username', user.username)
    expect(savedUser).toHaveProperty('passwordHash')

    const stringifiedUser = JSON.parse(JSON.stringify(savedUser))
    expect(stringifiedUser).toHaveProperty('username', user.username)
    expect(stringifiedUser).not.toHaveProperty('passwordHash')
  })
})
