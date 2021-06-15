const { v4: uuid } = require('uuid')

const { ChatMessage, ChatThread, User } = require('@pubsweet/models')

const clearDb = require('./_clearDb')

describe('ChatMessage model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = ChatMessage.knex()
    knex.destroy()
  })

  test('creates a new chat message', async () => {
    const user = await User.query().insert({})
    const relatedObject = uuid()

    const thread = await ChatThread.query().insert({
      chatType: 'reviewer',
      relatedObjectId: relatedObject,
    })

    const message = await ChatMessage.query().insert({
      chatThreadId: thread.id,
      userId: user.id,
      content: '<p>this is a test</p>',
    })

    expect(message.created).toBeDefined()
  })

  test('does not create a new chat message without content', async () => {
    const user = await User.query().insert({})
    const relatedObject = uuid()

    const thread = await ChatThread.query().insert({
      chatType: 'scienceOfficer',
      relatedObjectId: relatedObject,
    })

    const createMessageWithoutContent = () =>
      ChatMessage.query().insert({
        chatThreadId: thread.id,
        userId: user.id,
      })

    await expect(createMessageWithoutContent()).rejects.toThrow()

    const createMessageWithEmptyContent = () =>
      ChatMessage.query().insert({
        chatThreadId: thread.id,
        userId: user.id,
        content: '',
      })

    await expect(createMessageWithEmptyContent()).rejects.toThrow()
  })

  test('does not create a new chat message without a thread', async () => {
    const user = await User.query().insert({})

    const createMessage = () =>
      ChatMessage.query().insert({
        userId: user.id,
        content: 'test',
      })

    await expect(createMessage()).rejects.toThrow()
  })

  test('does not create a new chat message with an invalid thread', async () => {
    const user = await User.query().insert({})
    const threadId = uuid()

    const createMessage = () =>
      ChatMessage.query().insert({
        userId: user.id,
        content: 'test',
        chatThreadId: threadId,
      })

    await expect(createMessage()).rejects.toThrow()
  })

  test('does not create a new chat message without a user', async () => {
    const relatedObject = uuid()

    const thread = await ChatThread.query().insert({
      chatType: 'author',
      relatedObjectId: relatedObject,
    })

    const createMessage = () =>
      ChatMessage.query().insert({
        chatThreadId: thread.id,
        content: 'test',
      })

    await expect(createMessage()).rejects.toThrow()
  })

  test('does not create a new chat message with an invalid user', async () => {
    const userId = uuid()
    const relatedObject = uuid()

    const thread = await ChatThread.query().insert({
      chatType: 'author',
      relatedObjectId: relatedObject,
    })

    const createMessage = () =>
      ChatMessage.query().insert({
        chatThreadId: thread.id,
        content: 'test',
        userId,
      })

    await expect(createMessage()).rejects.toThrow()
  })

  test('fetches user of message', async () => {
    const user = await User.query().insert({})
    const relatedObject = uuid()

    const thread = await ChatThread.query().insert({
      chatType: 'reviewer',
      relatedObjectId: relatedObject,
    })

    const message = await ChatMessage.query().insert({
      chatThreadId: thread.id,
      userId: user.id,
      content: '<p>this is a test</p>',
    })

    const result = await ChatMessage.query()
      .findById(message.id)
      .withGraphFetched('user')

    expect(result.user.id).toEqual(user.id)
  })

  test('adds a created column as timestamp', async () => {
    const user = await User.query().insert({})
    const relatedObject = uuid()

    const thread = await ChatThread.query().insert({
      chatType: 'author',
      relatedObjectId: relatedObject,
    })

    const message = await ChatMessage.query().insert({
      chatThreadId: thread.id,
      userId: user.id,
      content: '<p>this is a test</p>',
    })

    const result = await ChatMessage.query().findById(message.id)
    expect(result.created).toBeInstanceOf(Date)
    expect(result.updated).toBeInstanceOf(Date)
  })
})
