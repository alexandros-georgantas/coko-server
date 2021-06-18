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
})
