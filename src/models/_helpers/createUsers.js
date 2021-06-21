// eslint-disable-next-line import/no-extraneous-dependencies
const { internet, name } = require('faker')
const range = require('lodash/range')
const { User, Identity, Team } = require('@pubsweet/models')
const { TeamMember } = require('..')

const createUserAndIdentity = async () => {
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

const createUsersAndIdentities = async n =>
  Promise.all(range(n).map(() => createUserAndIdentity()))

const createTeamWithMember = async roleString => {
  const user = await User.query().insert({
    password: 'qazwsx123',
    username: 'test',
  })

  const team = await Team.query().insert(
    {
      name: 'Test',
      role: roleString,
      global: true,
    },
    { relate: true },
  )

  await TeamMember.query().insert({
    userId: user.id,
    teamId: team.id,
  })

  return { user, team }
}

module.exports = {
  createUserAndIdentity,
  createUsersAndIdentities,
  createTeamWithMember,
}
