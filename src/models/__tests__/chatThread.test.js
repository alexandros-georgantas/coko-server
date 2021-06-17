const { v4: uuid } = require('uuid')
const { ChatMessage, ChatThread, User } = require('..')
const clearDb = require('./_clearDb')

describe('ChatThread Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = ChatThread.knex()
    knex.destroy()
  })

  test('creates a new thread', async () => {
    const relatedObject = uuid()

    const thread = await ChatThread.query().insert({
      chatType: 'scienceOfficer',
      relatedObjectId: relatedObject,
    })

    expect(thread.chatType).toEqual('scienceOfficer')
  })

  test('does not create new thread without a related object id', async () => {
    const createThread = () =>
      ChatThread.query().insert({
        chatType: 'reviewer',
      })

    await expect(createThread()).rejects.toThrow()
  })

  test('can retrieve the thread messages', async () => {
    const relatedObject = uuid()

    const userOne = await User.query().insert({})
    const userTwo = await User.query().insert({})
    const userThree = await User.query().insert({})

    const thread = await ChatThread.query().insert({
      chatType: 'author',
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

    await ChatMessage.query().insert(messages)

    const result = await ChatThread.query()
      .findById(thread.id)
      .withGraphFetched('messages')

    expect(result.messages).toHaveLength(3)
    expect(result.messages[0].userId).toEqual(messages[0].userId)
    expect(result.messages[1].content).toEqual(messages[1].content)
    expect(result.messages[2].chatThreadId).toEqual(messages[2].chatThreadId)
  })

  

  test('does not create a chat thread with an user id (removed in later versions)', async () => {
    const userId = uuid()
    const relatedObject = uuid()

    const createThread = async () =>
      ChatThread.query().insert({
        chatType: 'reviewer',
        userId,
        relatedObjectId: relatedObject,
      })

    await expect(createThread()).rejects.toThrow()
  })
})
