const api = require('../app')(require('express')())

const clearDb = require('../models/__tests__/_clearDb')
const { User } = require('../models')

const userData = {
  type: 'user',
  username: 'testuser',
  password: 'password',
}

describe('api/app locals', () => {
  beforeEach(async () => {
    await clearDb()

    return User.insert(userData)
  })

  it('exposes models', async () => {
    const userInstance = new api.locals.models.User()
    expect(userInstance.type).toEqual('user')

    const teamInstance = new api.locals.models.Team()
    expect(teamInstance.type).toEqual('team')

    // const fragmentInstance = new api.locals.models.Fragment()
    // expect(fragmentInstance.type).toEqual('fragment')

    // const colelctionInstance = new api.locals.models.Collection()
    // expect(colelctionInstance.type).toEqual('collection')

    const user = await api.locals.models.User.findOne({
      username: userData.username,
    })

    expect(user.username).toEqual(userData.username)
  })
})
