const { v4: uuid } = require('uuid')
const { ChatMessage, ChatThread } = require('../index')
const { createChatThreadTeamWithUsers } = require('./helpers/teams')

const {
  sendMessage,
  editMessage,
  deleteMessage,
} = require('../chatMessage/chatMessage.controller')

const clearDb = require('./_clearDb')

describe('ChatThread Controller', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = ChatMessage.knex()
    knex.destroy()
  })

  it('creates a message on a thread', async () => {
    const objectId = uuid()

    const chatThread = await ChatThread.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatThreadTeamWithUsers(chatThread.id)

    await sendMessage(chatThread.id, 'Hello', user.id)

    const fetchedChatThread = await ChatThread.findById(chatThread.id, {
      related: 'messages',
    })

    expect(fetchedChatThread.messages).toHaveLength(1)
    expect(fetchedChatThread.messages[0].content).toEqual('Hello')
  })

  it('edits only a message content on a thread', async () => {
    const objectId = uuid()

    const chatThread = await ChatThread.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatThreadTeamWithUsers(chatThread.id)

    const message = await sendMessage(chatThread.id, 'Hello', user.id)
    await editMessage(message.id, 'changed')

    const fetchedChatThread = await ChatThread.findById(chatThread.id, {
      related: 'messages',
    })

    expect(fetchedChatThread.messages).toHaveLength(1)
    expect(fetchedChatThread.messages[0].content).toEqual('changed')
  })

  it('edits a message content and mentions on a thread', async () => {
    const objectId = uuid()

    const chatThread = await ChatThread.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatThreadTeamWithUsers(chatThread.id)

    const message = await sendMessage(chatThread.id, 'Hello', user.id)
    await editMessage(message.id, 'changed', [user.id])

    const fetchedChatThread = await ChatThread.findById(chatThread.id, {
      related: 'messages',
    })

    expect(fetchedChatThread.messages).toHaveLength(1)
    expect(fetchedChatThread.messages[0].content).toEqual('changed')
    expect(fetchedChatThread.messages[0].mentions[0]).toEqual(user.id)
  })

  it('deletes a message from a thread', async () => {
    const objectId = uuid()

    const chatThread = await ChatThread.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatThreadTeamWithUsers(chatThread.id)

    const message = await sendMessage(chatThread.id, 'Hello', user.id)
    await deleteMessage(message.id)

    const fetchedChatThread = await ChatThread.findById(chatThread.id, {
      related: 'messages',
    })

    expect(fetchedChatThread.messages).toHaveLength(0)
  })
})
