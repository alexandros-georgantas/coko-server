const createGraphQLServer = require('../../../graphqlServer')
const { User } = require('../..')

const createTestServer = async () => {
  // the user that will be making the calls
  const user = await User.insert({})

  return createGraphQLServer(user.id)
}

module.exports = createTestServer
