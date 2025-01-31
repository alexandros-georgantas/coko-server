const { AuthorizationError, NotFoundError } = require('./errors')

// check permissions or throw authorization error
const can = async (userId, verb, entity) => {
  /* eslint-disable-next-line global-require */
  const authsome = require('./authsome')
  const permission = await authsome.can(userId, verb, entity)

  if (!permission) {
    throw new AuthorizationError(
      `Operation not permitted: ${
        userId || 'unauthenticated users'
      } cannot perform ${verb} operation on ${entity.type || entity}`,
    )
  }

  // return identity if no filter function
  return permission.filter || (id => id)
}

// check 'read' permissions or throw not found error (to avoid leaking the existence of data)
const canKnowAbout = async (userId, entity) => {
  /* eslint-disable-next-line global-require */
  const authsome = require('./authsome')
  const permission = await authsome.can(userId, 'read', entity)

  if (!permission) {
    throw new NotFoundError(
      `Object not found: ${entity.type} with id ${entity.id}`,
    )
  }

  // return identity if no filter function
  return permission.filter || (id => id)
}

// check permissions (in parallel) and swallow exceptions
const filterAll = async (userId, entities) => {
  const permissions = await Promise.all(
    entities.map(entity => can(userId, 'read', entity).catch(() => false)),
  )

  // apply permissions
  return entities.reduce((filtered, entity, index) => {
    const permissionOrFilter = permissions[index]

    if (permissionOrFilter) {
      filtered.push(permissionOrFilter(entity))
    }

    return filtered
  }, [])
}

module.exports = {
  can,
  canKnowAbout,
  filterAll,
}
