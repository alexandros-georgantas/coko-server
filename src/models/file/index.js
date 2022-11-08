const fs = require('fs')
const model = require('./file.model')

module.exports = {
  model,
  modelName: 'File',
  typeDefs: fs.readFileSync(`${__dirname}/file.graphql`, 'utf-8'),
}
