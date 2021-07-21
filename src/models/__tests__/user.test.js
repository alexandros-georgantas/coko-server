const find = require('lodash/find')

const {
  createUserAndDefaultIdentity,
  createUserAndIdentities,
} = require('./helpers/users')

const {
  createTeamWithUsers,
  createLocalTeamWithUsers,
} = require('./helpers/teams')

const clearDb = require('./_clearDb')

const {
  user,
  otherUser,
  userWithInvalidPassword,
  userWithFullName,
  userWithoutName,
} = require('./fixtures/users')

const { User } = require('..')

describe('User model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = User.knex()
    knex.destroy()
  })

  it('validates password correctly after saving to db', async () => {
    const newUser = await User.insert(user)

    const shouldBeValid = await newUser.isPasswordValid(user.password)

    expect(shouldBeValid).toEqual(true)
  })

  it('returns false when provided password is wrong', async () => {
    const newUser = await User.insert(user)

    const checkValidity = await newUser.isPasswordValid('wrong password')

    expect(checkValidity).toEqual(false)
  })

  it('throws error if trying to save a user with a non-unique username', async () => {
    await User.insert(user)
    const otherUserFixture = otherUser
    otherUserFixture.username = user.username

    const insertOtherUser = () =>
      User.insert({
        ...otherUserFixture,
      })

    await expect(insertOtherUser()).rejects.toThrow()
  })

  it('throws error if trying to save a user with a non-unique email', async () => {
    await User.insert(user)
    const otherUserFixture = otherUser
    otherUserFixture.email = user.email

    const insertOtherUser = () =>
      User.insert({
        ...otherUserFixture,
      })

    await expect(insertOtherUser()).rejects.toThrow()
  })

  it('should not contain field passwordHash', async () => {
    const newUser = await User.insert(user)
    const savedUser = await User.findById(newUser.id)
    const stringifiedUser = JSON.parse(JSON.stringify(savedUser))
    expect(stringifiedUser).not.toHaveProperty('passwordHash')
  })

  it('patches change of username', async () => {
    const newUser = await User.insert(user)

    const affectedRows = await User.patch({
      id: newUser.id,
      username: 'awesomo',
    })

    const updatedUser = await User.findById(newUser.id)
    expect(affectedRows).toEqual(1)
    expect(updatedUser.username).toEqual('awesomo')
  })

  it('patches change of username and fetches the modified user', async () => {
    const newUser = await User.insert(user)

    const updatedUser = await User.patchAndFetchById(newUser.id, {
      username: 'awesomo',
    })

    expect(updatedUser.username).toEqual('awesomo')
  })

  it('updates change of username', async () => {
    const newUser = await User.insert(user)

    const affectedRows = await User.update({
      id: newUser.id,
      username: 'awesomo',
    })

    const updatedUser = await User.findById(newUser.id)
    expect(affectedRows).toEqual(1)
    expect(updatedUser.username).toEqual('awesomo')
  })

  it('updates change of username and fetches the modified user', async () => {
    const newUser = await User.insert(user)

    const updatedUser = await User.updateAndFetchById(newUser.id, {
      username: 'awesomo',
    })

    expect(updatedUser.username).toEqual('awesomo')
  })

  it('updates password', async () => {
    const newUser = await User.insert(user)
    await User.updatePassword(newUser.id, user.password, 'newPassword')
    const fetchedUser = await User.findById(newUser.id)
    const isValid = await fetchedUser.isPasswordValid('newPassword')
    expect(isValid).toEqual(true)
  })

  it('deletes user', async () => {
    const newUser = await User.insert(user)

    const affectedRows = await User.deleteById(newUser.id)
    expect(affectedRows).toEqual(1)
    await expect(User.findById(newUser.id)).rejects.toThrow()
  })

  it('hasPassword (static) provides an alphanumeric string', async () => {
    const hash = await User.hashPassword('somepassword')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('throws when password is invalid user', async () => {
    await expect(User.insert(userWithInvalidPassword)).rejects.toThrow()
  })

  it('returns username as display name when givenNames and surname are not defined', async () => {
    const newUser = await User.insert(user)
    const displayName = await User.getDisplayName(newUser)
    expect(displayName).toEqual(user.username)
  })

  it('returns fullname when givenNames and surname are defined', async () => {
    const newUser = await User.insert(userWithFullName)
    const displayName = await User.getDisplayName(newUser)
    expect(displayName).toHaveLength(
      userWithFullName.givenNames.length + userWithFullName.surname.length + 1,
    )
  })

  it('throws error when neither username nor givenNames nor surname are defined', async () => {
    const newUser = await User.insert(userWithoutName)

    await expect(User.getDisplayName(newUser)).rejects.toThrow()
  })

  it('throws error when user tries to update hers/his password by providing an invalid one', async () => {
    const newUser = await User.insert(user)

    await expect(
      User.updatePassword(newUser.id, 'wrong old password', 'new password'),
    ).rejects.toThrow()
  })

  it('throws error when user tries to update hers/his password by providing the current one', async () => {
    const newUser = await User.insert(user)

    await expect(
      User.updatePassword(newUser.id, user.password, user.password),
    ).rejects.toThrow()
  })

  it('throws error when user tries to update hers/his password but this user does not exist', async () => {
    await expect(
      User.updatePassword('randomId', 'some old password', 'some new password'),
    ).rejects.toThrow()
  })

  it('throws error when findById does not contain id', async () => {
    await expect(User.findById()).rejects.toThrow()
  })

  it('throws error when deleteById does not contain id', async () => {
    await expect(User.deleteById()).rejects.toThrow()
  })
  it('throws error when patch does not contain data', async () => {
    await expect(User.patch()).rejects.toThrow()
  })

  it('throws error when patchAndFetchById does not contain neither id nor data', async () => {
    await expect(User.patchAndFetchById()).rejects.toThrow()
  })

  it('fetches user identities', async () => {
    const {
      user: newUser,
      id: identity1,
      id2: identity2,
    } = await createUserAndIdentities()

    const dbUser = await User.query()
      .findById(newUser.id)
      .withGraphFetched('identities')

    const found1 = find(dbUser.identities, { id: identity1.id })
    const found2 = find(dbUser.identities, { id: identity2.id })

    expect(dbUser.identities).toHaveLength(2)
    expect(found1).not.toBe(undefined)
    expect(found2).not.toBe(undefined)
  })

  it('fetches user default identity', async () => {
    const { user: newUser, id: identity } = await createUserAndDefaultIdentity()

    const dbUser = await User.query()
      .findById(newUser.id)
      .withGraphFetched('defaultIdentity')

    expect(dbUser.defaultIdentity.id).toEqual(identity.id)
    expect(dbUser.defaultIdentity.isDefault).toEqual(true)
  })

  it('fetches user teams', async () => {
    const { user: newUser, team } = await createTeamWithUsers()

    const dbUser = await User.query()
      .findById(newUser.id)
      .withGraphFetched('teams')

    expect(dbUser.teams).toHaveLength(1)
    expect(dbUser.teams[0].id).toEqual(team.id)
  })

  it('checks if a user is member of a global team (static)', async () => {
    const { user: newUser, team } = await createTeamWithUsers()
    const hasGlobalRole = await User.hasGlobalRole(newUser.id, team.role)
    expect(hasGlobalRole).toEqual(team.global)
  })

  it('checks if a user is member of a global team', async () => {
    const { user: newUser, team } = await createTeamWithUsers()
    const hasGlobalRole = await newUser.hasGlobalRole(team.role)
    expect(hasGlobalRole).toEqual(team.global)
  })

  it('throws when hasGlobalRole method does not have required params', async () => {
    const { team } = await createTeamWithUsers()
    await expect(User.hasGlobalRole(undefined, team.role)).rejects.toThrow()
  })

  it('checks if a user has permission to act on an object (static)', async () => {
    const { user: newUser, team } = await createLocalTeamWithUsers()

    const canAct = await User.hasRoleOnObject(
      newUser.id,
      team.role,
      team.objectId,
    )

    expect(canAct).toEqual(true)
  })

  it('checks if a user has permission to act on an object', async () => {
    const { user: newUser, team } = await createLocalTeamWithUsers()

    const canAct = await newUser.hasRoleOnObject(team.role, team.objectId)

    expect(canAct).toEqual(true)
  })

  it('throws when hasRoleOnObject method does not have required params', async () => {
    const { team } = await createTeamWithUsers()
    await expect(
      User.hasRoleOnObject(undefined, team.role, team.objectId),
    ).rejects.toThrow()
  })
})
