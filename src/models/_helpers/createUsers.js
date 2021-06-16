// eslint-disable-next-line import/no-extraneous-dependencies
const { internet, name } = require('faker')
const range = require('lodash/range')

const createUser = async () => {
  // eslint-disable-next-line global-require
  const { User, Identity } = require('@pubsweet/models')

  const user = await User.query().insert({
    givenNames: name.firstName(),
    surname: name.lastName(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: internet.email(),
    isConfirmed: true,
    isDefault: true,
  })

  return { user, id }
}

const createUsers = async n => Promise.all(range(n).map(() => createUser()))

module.exports = {
  createUser,
  createUsers,
}
