const axios = require('axios')
const { authenticatedCall } = require('../authenticatedCall')

jest.mock('../tokens', () => {
  return {
    getAuthTokens: jest.fn(() => 'token'),
  }
})

jest.mock('axios')

describe('Authenticated call', () => {
  it('calls provider with auth', async () => {
    axios.mockResolvedValue(true)
    const res = await authenticatedCall('123', 'lulu', {})
    expect(res).toBe(true)
  })
})
