const { boss } = require('pubsweet-server/src/jobs')
const { subscribeJobsToQueue } = require('../jobs')
const { jobs } = require('../services')
const { renewAuthTokens } = require('../utils/tokens')

const freezeTime = 1701856542000
const daySeconds = 24 * 3600

// Mock boss.<publish, subscribe>
jest.mock('pubsweet-server/src/jobs', () => {
  const originalModule = jest.requireActual('pubsweet-server/src/jobs')
  return {
    __esModule: true,
    ...originalModule,
    boss: {
      reset() {
        this.subscriptions = {}
        this.log = []
        this.lastJob = undefined
      },
      async publish(name, data, options) {
        this.log.push(`publish ${name}`)
        this.lastJob = dummyJob(data, options)
      },
      async subscribe(name, options, callback) {
        this.subscriptions[name] = { options, callback }
      },
    },
  }
})

// Mock Identity.findOne
jest.mock('../models', () => {
  const originalModule = jest.requireActual('../models')
  return {
    __esModule: true,
    ...originalModule,
    Identity: {
      // Fake an identity which expires in 7 days time
      findOne: async data => ({
        oauthRefreshTokenExpiration: new Date(
          freezeTime + daySeconds * 7 * 1000,
        ),
      }),
    },
  }
})

// Mock renewAuthTokens - don't send any api requests etc
jest.mock('../utils/tokens', () => {
  const originalModule = jest.requireActual('../utils/tokens')
  return {
    __esModule: true,
    ...originalModule,
    renewAuthTokens: jest.fn(async (userId, providerLabel) => {}),
  }
})

// Mock the date and time
Date.now = jest.fn(() => freezeTime)

const dummyJob = (data, options) => ({
  data,
  options,
  isDone: false,
  done() {
    this.isDone = true
  },
})

describe('jobs service', () => {
  beforeEach(async () => {
    // Reset the mock boss object
    boss.reset()
    subscribeJobsToQueue()
  })

  it('registers jobs', async () => {
    expect(Object.keys(boss.subscriptions)).toEqual([
      jobs.RENEW_AUTH_TOKENS_JOB,
    ])
    expect(
      typeof boss.subscriptions[jobs.RENEW_AUTH_TOKENS_JOB].callback,
    ).toEqual('function')
  })

  it('reschedules auth token renewal after successfully renewing the refresh token', async () => {
    boss.log = []

    // Run the job callback directly and then verify its behaviour
    const renewCallback =
      boss.subscriptions[jobs.RENEW_AUTH_TOKENS_JOB].callback

    const job = dummyJob(
      { userId: 'fakeUserId', providerLabel: 'fakeProviderLabel' },
      {},
    )

    await renewCallback(job)

    // renewAuthTokens should have been called
    expect(renewAuthTokens.mock.calls.length).toEqual(1)
    expect(renewAuthTokens.mock.calls[0]).toEqual([
      'fakeUserId',
      'fakeProviderLabel',
    ])

    // Job should succeed and be marked done
    expect(job.isDone).toBe(true)

    // Job should schedule a future job
    expect(boss.log).toEqual([`publish ${jobs.RENEW_AUTH_TOKENS_JOB}`])
    expect(boss.lastJob.data).toEqual(job.data)
    expect(Object.keys(boss.lastJob.options).length).toEqual(1)
    // Refresh token expires in 7 days and must be renewed in 6
    expect(boss.lastJob.options.startAfter).toEqual(daySeconds * 6)
  })
})
