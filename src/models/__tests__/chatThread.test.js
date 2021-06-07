const { v4: uuid } = require('uuid')

const { ChatMessage, ChatThread, User, Team } = require('@pubsweet/models')
const { TEAMS } = require('../../api/constants')

const clearDb = require('./_clearDb')

describe('ChatThread Model', () => {
  beforeAll(() => clearDb())
  afterEach(() => clearDb())

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

  test('can have more than one free-form chat type per related object per team', async () => {
    const relatedObject = uuid()

    const teamOne = await Team.query().insert({
      role: TEAMS.EDITOR,
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    const teamTwo = await Team.query().insert({
      role: TEAMS.REVIEWER,
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    const createThread = async teamId =>
      ChatThread.query().insert({
        chatType: 'reviewer',
        teamId,
        relatedObjectId: relatedObject,
      })

    // Different reviewer ids for the same related object should be fine
    await createThread(teamOne.id)
    await createThread(teamTwo.id)

    const threads = await ChatThread.query()
    expect(threads).toHaveLength(2)

    // But the same reviewer id on the same related object should be ok
    await createThread(teamOne.id)

    const threads2 = await ChatThread.query()
    expect(threads2).toHaveLength(3)
  })

  test('does not create a chat thread with an user id (changed to team id)', async () => {
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
