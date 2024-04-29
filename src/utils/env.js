const isEnvVariableTrue = variable => {
  return variable === '1' || variable === 1 || variable === 'true'
}

module.exports = {
  isEnvVariableTrue,
}
