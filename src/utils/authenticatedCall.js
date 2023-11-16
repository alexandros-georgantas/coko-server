const makeCall = require('./makeCall')
const getAuthTokens = require('./getAuthTokens')

const authenticatedCall = async (userId, providerLabel, callParameters) => {
  try {
    if (!callParameters) throw new Error(`Call parameters are required`)

    const accessToken = await getAuthTokens(userId, providerLabel)

    return makeCall(callParameters, accessToken)
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  authenticatedCall,
  getAuthTokens,
}
