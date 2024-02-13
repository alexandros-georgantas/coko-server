/* eslint-disable jest/no-done-callback */

const path = require('path')
const { spawn } = require('child_process')
const { startJobQueue } = require('../../jobs')

describe('job runner in a different process', () => {
  let jobQueue

  beforeAll(async () => {
    jobQueue = await startJobQueue()
  })

  it('submits a job and gets notified on completion', async done => {
    const queueName = 'aJobQueue2'

    // Add 2 jobs to the queue
    await jobQueue.publish(queueName, { param: 'aThing' })
    await jobQueue.publish(queueName, { param: 'anotherThing' })

    const jobProcessorPath = path.resolve(__dirname, 'jobProcessor.js')

    let jobCount = 0

    // Be notified on job completion with job result
    await jobQueue.onComplete(queueName, job => {
      try {
        expect(job.data.response).toEqual({ thing: 'someOtherThing' })
        jobCount += 1

        if (jobCount === 2) {
          jobProcessor.kill()
          done()
        }
      } catch (e) {
        done.fail(e)
      }
    })

    const jobProcessor = spawn('node', [jobProcessorPath], {
      stdio: 'inherit',
      /* eslint-disable-next-line no-underscore-dangle */
      env: { ...process.env, __TESTDBNAME: global.__testDbName },
    })
  })

  afterAll(async () => jobQueue.stop())
})
