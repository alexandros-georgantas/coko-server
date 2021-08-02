const { v4: uuid } = require('uuid')
const { ChatMessage, ChatThread, User } = require('../index')
const clearDb = require('./_clearDb')

describe('ChatThread Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = ChatThread.knex()
    knex.destroy()
  })

  it('does not create new thread without a related object id', async () => {
    const createThread = () =>
      ChatThread.insert({
        chatType: 'editors',
      })

    await expect(createThread()).rejects.toThrow()
  })

  it('can retrieve the thread messages', async () => {
    const relatedObject = uuid()

    const userOne = await User.insert({})
    const userTwo = await User.insert({})
    const userThree = await User.insert({})

    const thread = await ChatThread.insert({
      chatType: 'editors',
      relatedObjectId: relatedObject,
    })

    const messages = [
      {
        chatThreadId: thread.id,
        userId: userOne.id,
        content: 'this is it',
      },
      {
        chatThreadId: thread.id,
        userId: userTwo.id,
        content: 'is it?',
      },
      {
        chatThreadId: thread.id,
        userId: userThree.id,
        content: 'think so',
      },
    ]

    await ChatMessage.insert(messages)

    const result = await ChatThread.findById(thread.id, { related: 'messages' })

    expect(result.messages).toHaveLength(3)
    expect(result.messages[0].userId).toEqual(messages[0].userId)
    expect(result.messages[1].content).toEqual(messages[1].content)
    expect(result.messages[2].chatThreadId).toEqual(messages[2].chatThreadId)
  })
})
