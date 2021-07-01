const { User } = require('@pubsweet/models')
const authentication = require('pubsweet-server/src/authentication')
const { api } = require('../../../test')

const fixtures = require('./fixtures')

const clearDb = require('./_clearDb')

describe('User mutations', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = User.knex()
    knex.destroy()
  })

  test('a user can sign up', async () => {
    const { body } = await api.graphql.query(
      `mutation($input: UserInput) {
        createUser(input: $input) {
          username
          defaultIdentity {
            ... on Local {
              email
            }
          }
        }
      }`,
      {
        input: {
          username: 'hi',
          password: 'hello1234',
          email: 'hi@example.com',
        },
      },
    )

    expect(body).toEqual({
      data: {
        createUser: {
          username: 'hi',
          defaultIdentity: {
            email: 'hi@example.com',
          },
        },
      },
    })
  })

  test('errors when duplicate username or emails are used', async () => {
    await api.graphql.query(
      `mutation($input: UserInput) {
        createUser(input: $input) {
          username
        }
      }`,
      {
        input: {
          username: 'hi',
          password: 'hello1234',
          email: 'hi@example.com',
        },
      },
    )

    const { body: body2 } = await api.graphql.query(
      `mutation($input: UserInput) {
        createUser(input: $input) {
          username
        }
      }`,
      {
        input: {
          username: 'hi',
          password: 'hello1234',
          email: 'hi@example.com',
        },
      },
    )

    expect(body2).toEqual({
      data: {
        createUser: null,
      },
      errors: [
        {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
          message: 'User with this username or email already exists',
          name: 'ConflictError',
        },
      ],
    })
  })

  test('a user can update a password', async () => {
    const user = await User.query().insert({ ...fixtures.user })
    const token = authentication.token.create(user)

    const { body } = await api.graphql.query(
      `mutation($id: ID, $input: UserInput) {
        updateUser(id: $id, input: $input) {
          username
        }
      }`,
      {
        id: user.id,
        input: {
          username: 'hi',
          password: 'hello1234',
          email: 'doesnt@actually.matter',
        },
      },
      token,
    )

    expect(body).toEqual({
      data: {
        updateUser: {
          username: 'hi',
        },
      },
    })

    const oldHash = user.passwordHash
    const foundUser = await User.findById(user.id)

    expect(oldHash).not.toEqual(foundUser.passwordHash)
  })
})
