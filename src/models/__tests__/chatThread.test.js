const { v4: uuid } = require('uuid')

const {
  ChatMessage,
  ChatThread,
  ChatRelatedObject,
  User,
} = require('@pubsweet/models')

const clearDb = require('./_clearDb')

describe('ChatThread Model', () => {
  beforeAll(() => clearDb())
  afterEach(() => clearDb())

  afterAll(() => {
    const knex = ChatThread.knex()
    knex.destroy()
  })

  test('creates a new thread', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const thread = await ChatThread.query().insert({
      chatType: 'scienceOfficer',
      relatedObjectId: relatedObject.id,
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

  test('does not create a new thread with an invalid related object id', async () => {

    const createThread = () =>
      ChatThread.query().insert({
        chatType: 'reviewer',
	relatedObjectId: uuid(),
      })

    await expect(createThread()).rejects.toThrow()
  })

  test('does not create a new thread without a valid chat type', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const createThread = () =>
      ChatThread.query().insert({
        chatType: 'wrong',
	relatedObjectId: relatedObject.id
      })

    await expect(createThread()).rejects.toThrow()
  })

  test('can retrieve the thread messages', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const userOne = await User.query().insert({})
    const userTwo = await User.query().insert({})
    const userThree = await User.query().insert({})
    const thread = await ChatThread.query().insert({
      chatType: 'author',
      relatedObjectId: relatedObject.id,
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
      .eager('messages')

    expect(result.messages).toHaveLength(3)
    expect(result.messages[0].userId).toEqual(messages[0].userId)
    expect(result.messages[1].content).toEqual(messages[1].content)
    expect(result.messages[2].chatThreadId).toEqual(messages[2].chatThreadId)
  })

  // 
  test('can only have one author chat per related object', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})
    console.log(relatedObject)
    const createThread = async () =>
      ChatThread.query().insert({
        chatType: 'author',
	relatedObjectId: relatedObject.id,
      })

    // First should be fine, second should make the constraint throw
    await createThread()
    await expect(createThread()).rejects.toThrow()
  })

  test('can only have one science officer chat per related object', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const createThread = async () =>
      ChatThread.query().insert({
        chatType: 'scienceOfficer',
	relatedObjectId: relatedObject.id,
      })

    // First should be fine, second should make the constraint throw
    await createThread()
    await expect(createThread()).rejects.toThrow()
  })

  test('can only have one reviewer chat per related object per reviewer', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const userOne = await User.query().insert({})
    const userTwo = await User.query().insert({})

    const createThread = async reviewerId =>
      ChatThread.query().insert({
        chatType: 'reviewer',
        userId: reviewerId,
	relatedObjectId: relatedObject.id,
      })

    // Different reviewer ids for the same related object should be fine
    await createThread(userOne.id)
    await createThread(userTwo.id)

    const threads = await ChatThread.query()
    expect(threads).toHaveLength(2)

    // But the same reviewer id on the same related object should make the constraint throw
    await expect(createThread(userOne.id)).rejects.toThrow()
  })

  test('can only have one curator chat per related object per curator', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const userOne = await User.query().insert({})
    const userTwo = await User.query().insert({})

    const createThread = async curatorId =>
      ChatThread.query().insert({
        chatType: 'curator',
        userId: curatorId,
	relatedObjectId: relatedObject.id,
      })

    // Different curator ids for the same related object should be fine
    await createThread(userOne.id)
    await createThread(userTwo.id)

    const threads = await ChatThread.query()
    expect(threads).toHaveLength(2)

    // But the same curator id on the same related object should make the constraint throw
    await expect(createThread(userOne.id)).rejects.toThrow()
  })

  test('user id must not be null for reviewer chats', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const createThread = async () =>
      ChatThread.query().insert({
        chatType: 'reviewer',
	relatedObjectId: relatedObject.id
      })

    await expect(createThread()).rejects.toThrow()
  })

  test('user id must not be null for curator chats', async () => {
    const relatedObject = await ChatRelatedObject.query().insert({})

    const createThread = async () =>
      ChatThread.query().insert({
        chatType: 'curator',
	relatedObjectId: relatedObject.id,
      })

    await expect(createThread()).rejects.toThrow()
  })

  test('user id must be null for author and science officer chats', async () => {
    const user = await User.query().insert({})
    const relatedObject = await ChatRelatedObject.query().insert({})

    const createAuthorThread = async () =>
      ChatThread.query().insert({
        chatType: 'author',
        userId: user.id,
	relatedObjectId: relatedObject.id,
      })

    const createSOThread = async () =>
      ChatThread.query().insert({
        chatType: 'scienceOfficer',
        userId: user.id,
	relatedObjectId: relatedObject.id,
      })

    await expect(createAuthorThread()).rejects.toThrow()
    await expect(createSOThread()).rejects.toThrow()
  })

  test('does not create a new reviewer thread with an invalid reviewer id', async () => {
    const userId = uuid()
    const relatedObject = await ChatRelatedObject.query().insert({})

    const createThread = async () =>
      ChatThread.query().insert({
        chatType: 'reviewer',
        userId: userId,
	relatedObjectId: relatedObject.id,
      })

    await expect(createThread()).rejects.toThrow()
  })

  test('creates curator thread', async () => {
    const curator = await User.query().insert({})
    const relatedObject = await ChatRelatedObject.query().insert({})

    let threads

    const findThreads = async () =>
      ChatThread.query().where({
        userId: curator.id,
        chatType: 'curator',
	relatedObjectId: relatedObject.id,
      })

    await ChatThread.createCuratorThread(relatedObject.id, curator.id)

    threads = await findThreads()
    expect(threads).toHaveLength(1)

    // this time it already exists, so call should be ignored
    await ChatThread.createCuratorThread(relatedObject.id, curator.id)

    threads = await findThreads()
    expect(threads).toHaveLength(1) // still 1
  })
})
