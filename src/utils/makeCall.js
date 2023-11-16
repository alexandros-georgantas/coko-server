const axios = require('axios')
const clone = require('lodash/clone')

const makeCall = async (callParameters, token) => {
  const axiosParams = clone(callParameters)
  const { headers } = axiosParams

  if (!headers) {
    axiosParams.headers = {
      authorization: `Bearer ${token}`,
    }
  } else {
    axiosParams.headers.authorization = `Bearer ${token}`
  }

  return axios(axiosParams)
}

module.exports = makeCall
