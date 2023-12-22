const { boss } = require('pubsweet-server/src/jobs')
const logger = require('@pubsweet/logger')

const { pubsubManager } = require('pubsweet-server')
const { jobs } = require('./services')

const {
  subscriptions: { USER_UPDATED },
} = require('./models/user/constants')

const { getUser } = require('./models/user/user.controller')

/**
 * Add a list of jobs to the job queue. If no jobs are specified, subscribe all
 * preconfigured jobs to the queue.
 */
const subscribeJobsToQueue = async jobsList => {
  logger.info('Subscribing job callbacks to the job queue')
  const jobsToSubscribe = jobsList || defaultJobs
  const existingSubscriptions = boss.manager?.subscriptions || {}
  await Promise.all(
    jobsToSubscribe.map(async ({ name, callback, subscribeOptions = {} }) => {
      try {
        if (!(name instanceof String || typeof name === 'string')) {
          throw new Error('Invalid name')
        }

        if (!(callback instanceof Function)) {
          throw new Error('Invalid callback')
        }

        if (!(subscribeOptions instanceof Object)) {
          throw new Error('Invalid subscribeOptions')
        }

        // Don't resubscribe - it creates unexpected behaviour
        if (existingSubscriptions[name] === undefined) {
          await boss.subscribe(name, subscribeOptions, callback)
          logger.info(`Job ${name}: subscribed`)
        } else {
          throw new Error('Already subscribed')
        }
      } catch (e) {
        logger.error(`Job ${name}: subscribe error:`, e)
        throw e
      }
    }),
  )
}

// TODO - append jobs found in config

// Define default jobs
const defaultJobs = [
  // {
  //   name: jobs.RENEW_AUTH_TOKENS_JOB,
  //   callback: async job => {
  //     const bufferTime = 24 * 3600
  //     const { userId, providerLabel } = job.data

  //     try {
  //       await renewAuthTokens(userId, providerLabel)
  //       job.done()
  //     } catch (e) {
  //       logger.error(`Job ${jobs.RENEW_AUTH_TOKENS_JOB}: callback error:`, e)
  //       throw e
  //     }

  //     try {
  //       // Schedule auth renewal
  //       const { oauthRefreshTokenExpiration } = await Identity.findOne({
  //         userId,
  //         provider: providerLabel,
  //       })

  //       const expiresIn = (oauthRefreshTokenExpiration - moment().utc()) / 1000

  //       const renewAfter = expiresIn - bufferTime

  //       if (renewAfter < 0) {
  //         throw new Error('"renewAfter" is less than 0')
  //       }

  //       await jobs.defer(
  //         jobs.RENEW_AUTH_TOKENS_JOB,
  //         { seconds: renewAfter },
  //         { userId, providerLabel },
  //       )
  //     } catch (e) {
  //       logger.error(`Job ${jobs.RENEW_AUTH_TOKENS_JOB}: defer error:`, e)
  //       throw e
  //     }
  //   },
  // },
  {
    name: jobs.REFRESH_TOKEN_EXPIRED,
    callback: async job => {
      try {
        const pubsub = await pubsubManager.getPubsub()
        const { userId } = job.data

        const updatedUser = await getUser(userId)

        pubsub.publish(USER_UPDATED, {
          userUpdated: updatedUser,
        })
        job.done()
      } catch (e) {
        logger.error(`Job ${jobs.REFRESH_TOKEN_EXPIRED}: defer error:`, e)
        throw e
      }
    },
  },
]

module.exports = { subscribeJobsToQueue }
