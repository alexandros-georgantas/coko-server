const { v4: uuid } = require('uuid')
const { ChatThread } = require('../index')

const {
  getChatThreads,
  getChatThread,
} = require('../chatThread/chatThread.controller')

const clearDb = require('./_clearDb')

describe('ChatThread Controller', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = ChatThread.knex()
    knex.destroy()
  })

  it('fetches all the available threads', async () => {
    const objectId = uuid()

    const chatThread1 = await ChatThread.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const chatThread2 = await ChatThread.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { result: chatThreads } = await getChatThreads()
    expect(chatThreads).toHaveLength(2)
    expect(chatThreads[0].id).toEqual(chatThread1.id)
    expect(chatThreads[1].id).toEqual(chatThread2.id)
  })

  it('fetches thread based on provided id', async () => {
    const objectId = uuid()

    const chatThread = await ChatThread.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const fetchedChatThread = await getChatThread(chatThread.id)
    expect(fetchedChatThread).toBeDefined()
  })
})
