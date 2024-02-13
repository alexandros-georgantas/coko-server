/* eslint-disable jest/no-commented-out-tests */

// const { omit } = require('lodash')

// const authsome = require('../../authsome')
const clearDb = require('../../models/__tests__/_clearDb')
const api = require('../helpers/api')
const authentication = require('../../authentication')
const { User } = require('../../models')

describe('GraphQL authentication', () => {
  let token
  let user

  const userData = {
    username: 'testuser',
    password: 'password',
  }

  beforeEach(async () => {
    await clearDb()
    user = await User.insert(userData)
    token = authentication.token.create(user)
  })

  describe('loginUser mutation', () => {
    it('can log in', async () => {
      const { body } = await api.graphql.query(
        `mutation($input: LoginInput!) {
          login(input: $input) {
            user { username }
            token
          }
        }`,
        { input: { username: 'testuser', password: 'password' } },
      )

      expect(body).toMatchObject({
        data: {
          login: {
            token: expect.any(String),
            user: { username: 'testuser' },
          },
        },
      })
    })

    it('blocks invalid login', async () => {
      const { body } = await api.graphql.query(
        `mutation($input: LoginInput!) {
          login(input: $input) {
            token
          }
        }`,
        { input: { username: 'testuser', password: 'not correct' } },
      )

      expect(body).toMatchObject({
        data: null,
        errors: [
          {
            message: 'AuthorizationError: Wrong username or password.',
          },
        ],
      })
    })
  })

  describe('currentUser query', () => {
    it('returns null when unauthenticated', async () => {
      const { body } = await api.graphql.query(`{ currentUser { username } }`)

      expect(body).toMatchObject({
        data: {
          currentUser: null,
        },
      })
    })

    it('fetches current user from token', async () => {
      const { body } = await api.graphql.query(
        `{ currentUser { username, teams { role }} }`,
        {},
        token,
      )

      expect(body).toMatchObject({
        data: {
          currentUser: {
            username: 'testuser',
            teams: [],
          },
        },
      })
    })

    it('errors when user not found', async () => {
      const badToken = authentication.token.create({
        id: '123e4567-e89b-12d3-a456-426655440000',
        username: 'does not exist',
      })

      const { body } = await api.graphql.query(
        `{ currentUser { username } }`,
        {},
        badToken,
      )

      expect(body).toMatchObject({
        data: {
          currentUser: null,
        },
        errors: [
          {
            message: 'Something went wrong! Please contact your administrator',
          },
        ],
      })
    })
  })

  /* eslint-disable-next-line jest/no-disabled-tests */
  // describe.skip('user query', () => {
  //   it('errors when unauthenticated', async () => {
  //     const { body } = await api.graphql.query(`{
  //       users {
  //         result {
  //           username
  //         }
  //       }
  //     }`)

  //     expect(body).toMatchObject({
  //       data: { users: null },
  //       errors: [
  //         {
  //           message:
  //             'Operation not permitted: unauthenticated users cannot perform read operation on User',
  //         },
  //       ],
  //     })
  //   })

  //   it('filters the returned data', async () => {
  //     jest
  //       .spyOn(authsome, 'can')
  //       /* eslint-disable-next-line no-shadow */
  //       .mockReturnValue({ filter: user => omit(user, 'email') })

  //     const { body } = await api.graphql.query(
  //       `{ users { username, email } }`,
  //       {},
  //       token,
  //     )

  //     expect(body).toEqual({
  //       data: { users: [{ username: 'testuser', email: null }] },
  //     })
  //   })

  //   it('returns not found if not authorized', async () => {
  //     jest
  //       .spyOn(authsome, 'can')
  //       .mockReturnValueOnce(true)
  //       .mockReturnValueOnce(false)

  //     const { body } = await api.graphql.query(
  //       `query($id: ID) {
  //         user(id: $id) {
  //           username
  //         }
  //       }`,
  //       { id: user.id },
  //       token,
  //     )

  //     expect(body).toMatchObject({
  //       data: { user: null },
  //       errors: [{ message: `Object not found: user with id ${user.id}` }],
  //     })
  //   })
  // })
})
