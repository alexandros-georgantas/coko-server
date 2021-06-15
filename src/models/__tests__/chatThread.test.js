const { v4: uuid } = require('uuid')
const config = require('config')
const { ChatMessage, ChatThread, User, Team } = require('@pubsweet/models')

const globalTeams = config.get('teams.global')
const nonGlobalTeams = config.get('teams.nonglobal')

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

  test('Relating chatThreads to Teams , global and non-global ', async () => {
    const relatedObject = uuid()

    const createThread = async relatedObjectId =>
      ChatThread.query().insert({
        chatType: 'reviewer',
        relatedObjectId,
      })

    // the same relatedObject id on another chat thread should be ok
    const ctOne = await createThread(relatedObject)
    const ctTwo = await createThread(relatedObject)

    const threads = await ChatThread.query()
    expect(threads).toHaveLength(2)

    await Team.query().insert({
      role: nonGlobalTeams.EDITOR,
      objectId: ctOne.id,
      objectType: 'unknownObject',
      global: false,
    })

    await Team.query().insert({
      role: nonGlobalTeams.EDITOR,
      objectId: ctTwo.id,
      objectType: 'unknownObject',
      global: false,
    })

    // We should be able to link the different chat threads to two different teams
    const teams = await Team.query()
    expect(teams).toHaveLength(2)

    // a non-global team can't have the same chatThread associated with it with same role.

    await expect(
      Team.query().insert({
        role: nonGlobalTeams.EDITOR,
        objectId: ctTwo.id,
        objectType: 'unknownObject',
        global: false,
      }),
    ).rejects.toThrow()

    // same chatThread but different role works.
    await Team.query().insert({
      role: nonGlobalTeams.SCIENCE_OFFICER,
      objectId: ctTwo.id,
      objectType: 'unknownObject',
      global: false,
    })

    // We should be able to link the different chat threads to two different teams
    const teams2 = await Team.query()
    expect(teams2).toHaveLength(3)

    // and have a global team can't have a chatThread associated with it at all.

    await expect(
      Team.query().insert({
        role: globalTeams.GLOBAL_SECTION_EDITOR,
        objectId: ctTwo.id,
        objectType: 'unknownObject',
        global: true,
      }),
    ).rejects.toThrow()
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
