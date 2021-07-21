// eslint-disable-next-line import/no-extraneous-dependencies
const { internet, name } = require('faker')
const { User, Identity, Team } = require('../../index')

const createUser = async => {
  try {
    return User.insert({
      givenNames: name.firstName(),
      surname: name.lastName(),
    })
  } catch (e) {
    throw new Error(e)
  }
}

const createUserAndDefaultIdentity = async () => {
  const user = await User.query().insert({
    givenNames: name.firstName(),
    surname: name.lastName(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: internet.email(),
    isVerified: true,
    isDefault: true,
  })

  return { user, id }
}

const createUserAndIdentities = async () => {
  const user = await User.query().insert({
    givenNames: name.firstName(),
    surname: name.lastName(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: internet.email(),
    isVerified: true,
    isDefault: true,
  })

  const id2 = await Identity.query().insert({
    userId: user.id,
    email: internet.email(),
    isVerified: true,
    isDefault: false,
  })

  return { user, id, id2 }
}

module.exports = {
  createUser,
  createUserAndIdentities,
  createUserAndDefaultIdentity,
}
