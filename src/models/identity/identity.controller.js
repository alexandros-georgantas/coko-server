const Identity = require('./identity.model')

const getUserIdentities = async userId => {
  try {
    return Identity.find({ userId })
  } catch (e) {
    throw new Error(e)
  }
}

const getDefaultIdentity = async userId => {
  try {
    return Identity.findOne({
      userId,
      isDefault: true,
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = { getUserIdentities, getDefaultIdentity }
