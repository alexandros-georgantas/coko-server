const createGraphQLServer = require('../../../graphqlServer')
const { User } = require('../..')

const createTestServer = async user => {
  // the user that will be making the calls
  const testUser = user || (await User.insert({}))

  return createGraphQLServer(testUser.id)
}

module.exports = createTestServer
