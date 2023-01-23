const fs = require('fs')
const path = require('path')
const model = require('./file.model')

module.exports = {
  model,
  modelName: 'File',
  typeDefs: fs.readFileSync(path.join(__dirname, 'file.graphql'), 'utf-8'),
}
