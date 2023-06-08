const cleanUndefined = object =>
  Object.keys(object)
    .filter(k => object[k] !== undefined)
    .reduce((acc, k) => {
      acc[k] = object[k]
      return acc
    }, {})

const displayNameConstructor = (givenNames, surname, username) => {
  if (givenNames && surname) return `${givenNames} ${surname}`
  if (username) return username

  throw new Error('User model: Cannot get displayName')
}

module.exports = { cleanUndefined, displayNameConstructor }
