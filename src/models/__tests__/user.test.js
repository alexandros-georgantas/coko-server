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

  it('uses custom JSON serialization in an array', async () => {
    const users = [
      { username: 'user1', password: 'fooqazwsx1' },
      { username: 'user2', password: 'fooqazwsx2' },
      { username: 'user3', password: 'fooqazwsx3' },
    ]

    await Promise.all(users.map(user => User.query().insert({ ...user })))

    const savedUsers = await User.all()

    const savedUser = savedUsers[2]
    expect(savedUser).toHaveProperty('username')
    expect(savedUser).toHaveProperty('passwordHash')

    const stringifiedUsers = JSON.parse(JSON.stringify(savedUsers))
    const stringifiedUser = stringifiedUsers[2]

    expect(stringifiedUser).toHaveProperty('username', savedUser.username)
    expect(stringifiedUser).not.toHaveProperty('passwordHash')
  })

  it('finds a list of users', async () => {
    const users = [
      { username: 'user1', password: 'fooqazwsx1' },
      { username: 'user2', password: 'fooqazwsx2' },
      { username: 'user3', password: 'fooqazwsx3' },
    ]

    await Promise.all(users.map(user => User.query().insert({ ...user })))

    const items = await User.findByField('username', 'user1')

    expect(items).toHaveLength(1)
    expect(items[0]).toBeInstanceOf(User)
  })

  it('finds a single user by field', async () => {
    const users = [
      { username: 'user1', password: 'fooqazwsx1' },
      { username: 'user2', password: 'fooqazwsx2' },
      { username: 'user3', password: 'fooqazwsx3' },
    ]

    await Promise.all(users.map(user => User.query().insert({ ...user })))

    const item = await User.findOneByField('username', 'user2')

    expect(item).toBeInstanceOf(User)

    expect(item).toEqual(
      expect.objectContaining({
        username: 'user2',
        // XXX add in passwordHash comparison
      }),
    )
  })

  it('fails password verification if passwordHash is not present', async () => {
    const fixtureWithoutPassword = { ...fixtures.user }
    delete fixtureWithoutPassword.password

    const user = await User.query().insert({ ...fixtureWithoutPassword })

    const validPassword1 = await user.validPassword(undefined)
    expect(validPassword1).toEqual(false)
    const validPassword2 = await user.validPassword(null)
    expect(validPassword2).toEqual(false)
    const validPassword3 = await user.validPassword('somethingfunky')
    expect(validPassword3).toEqual(false)
  })
})
