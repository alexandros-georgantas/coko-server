const { startServer } = require('../src')

const init = async () => {
  try {
    return startServer()
  } catch (e) {
    throw new Error(e)
  }
}

init()
