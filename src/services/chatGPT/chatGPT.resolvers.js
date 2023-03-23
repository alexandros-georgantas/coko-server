const chatGPT = require('./chatGPT.controllers')

const chatGPTResolver = async (_, { input }) => {
  return chatGPT(input)
}

module.exports = {
  Query: {
    chatGPT: chatGPTResolver,
  },
}
