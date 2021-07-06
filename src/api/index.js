const path = require('path')
const { loadFilesSync } = require('@graphql-tools/load-files')
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge')

// Auto load type defs by "<type>/<type>.graphql" file convention
const typesArray = loadFilesSync(path.join(__dirname, './**/*.graphql'), {
  extensions: ['graphql'],
})

const typeDefs = mergeTypeDefs(typesArray)

// Auto load resolvers by "<type>/<type>.resolver.js" file convention
const resolversArray = loadFilesSync(path.join(__dirname, './**/*.resolver.js'))
const resolvers = mergeResolvers(resolversArray)

module.exports = {
  resolvers,
  typeDefs,
}
