const logger = require('../logger')
const useTransaction = require('../models/useTransaction')
const ActivityLog = require('../models/activityLog/activityLog.model')

const {
  labels: { ACTIVITY_LOG_SERVICE },
} = require('../models/activityLog/constants')

const activityLog = async (data, options = {}) => {
  try {
    const { trx } = options

    return useTransaction(
      async tr => {
        return ActivityLog.insert(data, { trx: tr })
      },
      {
        trx,
        passedTrxOnly: true,
      },
    )
  } catch (e) {
    logger.error(`${ACTIVITY_LOG_SERVICE} activityLog: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = activityLog
