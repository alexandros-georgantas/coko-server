const createGraphQLServer = require('../../../graphqlServer')
const { User } = require('../..')

const createTestServer = async (passedUserId = undefined) => {
  // the user that will be making the calls
  let userId = passedUserId

  if (!passedUserId) {
    const user = await User.insert({})
    userId = user.id
  }

  return createGraphQLServer(userId)
}

module.exports = createTestServer
