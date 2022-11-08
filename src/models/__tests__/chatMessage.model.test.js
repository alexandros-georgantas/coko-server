const { v4: uuid } = require('uuid')
const { createChatThreadTeamWithUsers } = require('./helpers/teams')
const { ChatMessage, ChatThread, User } = require('../index')

const clearDb = require('./_clearDb')

describe('ChatMessage model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = ChatMessage.knex()
    knex.destroy()
  })

  it('does not create a new chat message without content', async () => {
    const user = await User.insert({})
    const relatedObject = uuid()

    const thread = await ChatThread.insert({
      chatType: 'editors',
      relatedObjectId: relatedObject,
    })

    const createMessageWithoutContent = () =>
      ChatMessage.insert({
        chatThreadId: thread.id,
        userId: user.id,
      })

    await expect(createMessageWithoutContent()).rejects.toThrow()

    const createMessageWithEmptyContent = () =>
      ChatMessage.insert({
        chatThreadId: thread.id,
        userId: user.id,
        content: '',
      })

    await expect(createMessageWithEmptyContent()).rejects.toThrow()
  })

  it('does not create a new chat message without a thread', async () => {
    const user = await User.insert({})

    const createMessage = () =>
      ChatMessage.insert({
        userId: user.id,
        content: 'test',
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('does not create a new chat message with an invalid thread', async () => {
    const user = await User.insert({})
    const threadId = uuid()

    const createMessage = () =>
      ChatMessage.insert({
        userId: user.id,
        content: 'test',
        chatThreadId: threadId,
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('does not create a new chat message without a user', async () => {
    const relatedObject = uuid()

    const thread = await ChatThread.insert({
      chatType: 'authors',
      relatedObjectId: relatedObject,
    })

    const createMessage = () =>
      ChatMessage.insert({
        chatThreadId: thread.id,
        content: 'test',
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('does not create a new chat message with an invalid user', async () => {
    const userId = uuid()
    const relatedObject = uuid()

    const thread = await ChatThread.insert({
      chatType: 'authors',
      relatedObjectId: relatedObject,
    })

    const createMessage = () =>
      ChatMessage.insert({
        chatThreadId: thread.id,
        content: 'test',
        userId,
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('fetches user of message', async () => {
    const user = await User.insert({})
    const relatedObject = uuid()

    const thread = await ChatThread.insert({
      chatType: 'reviewers',
      relatedObjectId: relatedObject,
    })

    const message = await ChatMessage.insert({
      chatThreadId: thread.id,
      userId: user.id,
      content: '<p>this is a test</p>',
    })

    const result = await ChatMessage.findById(message.id, { related: 'user' })

    expect(result.user.id).toEqual(user.id)
  })

  it('adds mentioned user to chat message', async () => {
    const relatedObject = uuid()

    const thread = await ChatThread.insert({
      chatType: 'reviewers',
      relatedObjectId: relatedObject,
    })

    const { user } = await createChatThreadTeamWithUsers(thread.id)

    const message = await ChatMessage.insert({
      chatThreadId: thread.id,
      userId: user.id,
      content: '<p>this is a test</p>',
      mentions: [user.id],
    })

    expect(message.mentions).toHaveLength(1)
    expect(message.mentions[0]).toEqual(user.id)
  })

  /* eslint-disable-next-line jest/no-commented-out-tests */
  // it('throws when mentioned user is not team member of chatThread', async () => {
  //   const user2 = await User.insert({})
  //   const relatedObject = uuid()

  //   const thread = await ChatThread.insert({
  //     chatType: 'reviewers',
  //     relatedObjectId: relatedObject,
  //   })

  //   const { user } = await createChatThreadTeamWithUsers(thread.id)

  //   await expect(
  //     ChatMessage.insert({
  //       chatThreadId: thread.id,
  //       userId: user.id,
  //       content: '<p>this is a test</p>',
  //       mentions: [user2.id],
  //     }),
  //   ).rejects.toThrow()
  // })

  /* eslint-disable-next-line jest/no-commented-out-tests */
  // it('throws when updating a message mentions array with a user who is not team member of chatThread', async () => {
  //   const user2 = await User.insert({})
  //   const relatedObject = uuid()

  //   const thread = await ChatThread.insert({
  //     chatType: 'reviewers',
  //     relatedObjectId: relatedObject,
  //   })

  //   const { user } = await createChatThreadTeamWithUsers(thread.id)

  //   const message = await ChatMessage.insert({
  //     chatThreadId: thread.id,
  //     userId: user.id,
  //     content: '<p>this is a test</p>',
  //   })

  //   await expect(
  //     message.patch({
  //       mentions: [user2.id],
  //     }),
  //   ).rejects.toThrow()
  // })
})
