const moment = require('moment')

const getExpirationTime = secondsFromNow => {
  return moment().utc().add(secondsFromNow, 'seconds').toDate()
}

module.exports = {
  getExpirationTime,
}
