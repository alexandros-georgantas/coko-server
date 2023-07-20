const path = require('path')

const getTestFilePath = filename =>
  path.join(__dirname, '..', '..', '..', 'tmp', filename)

module.exports = {
  getTestFilePath,
}
