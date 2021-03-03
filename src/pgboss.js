const { boss, connectToJobQueue } = require('pubsweet-server/src/jobs')

module.exports = {
  boss,

  // drop-in replacement for current ps-server function
  connectToJobQueue,
}
