/* eslint-disable jest/no-disabled-tests */

const chatGPT = require('../chatGPT/chatGPT.controllers')
const createTestServer = require('../../models/__tests__/helpers/createTestServer')

describe('ChatGPT', () => {
  /**
   * Keep disabled by default, as these tests connect to an external api that
   * might be down, causing pipelines to fail through no fault of our own.
   */

  it.skip('returns text given a prompt', async () => {
    // config.get.mockReturnValue(process.env.CHAT_GPT_KEY)
    const result = await chatGPT('what is the coko foundation')
    console.log(result) // eslint-disable-line no-console
    expect(result).toBeTruthy()
  }, 20000)

  it.skip('uses the graphql resolver to call the openai api', async () => {
    const CHAT_GPT = `
      query chatGPT ($input: String!) {
        chatGPT (input: $input)
      }
    `

    const server = await createTestServer()

    const result = await server.executeOperation({
      query: CHAT_GPT,
      variables: {
        input: 'what is the coko foundation',
      },
    })

    console.log(result.data.chatGPT) // eslint-disable-line no-console
    expect(result.data.chatGPT).toBeTruthy()

    expect(true).toBeTruthy()
  }, 20000)
})
