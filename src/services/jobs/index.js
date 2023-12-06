const { deferJob } = require('./jobs.publish')
const jobIdentifiers = require('./jobs.identifiers')

module.exports = {
  ...jobIdentifiers,
  defer: deferJob,
}
