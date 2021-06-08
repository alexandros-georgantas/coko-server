const { internet, name } = require('faker')
const range = require('lodash/range')

const {
  User,
  Identity
} = require('@pubsweet/models')

const createUser = async () => {
  const user = await User.query().insert({
    givenNames: name.firstName(),
    surname: name.lastName(),
  })

  await Identity.query().insert({
    userId: user.id,
    email: internet.email(),
    isConfirmed: true,
    isDefault: true,
  })

  return user
}

const createUsers = async n => Promise.all(range(n).map(() => createUser()))

module.exports = {
  createUser,
  createUsers,
}
