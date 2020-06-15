const config = require('config')
const { isEmpty } = require('lodash')
const { middleware } = require('graphql-middleware')

// const logger = require('@pubsweet/logger')

const generator = middleware(schema => {
  const emailService =
    config.has('emailMiddleware.service') &&
    config.get('emailMiddleware.service')

  if (isEmpty(emailService)) {
    throw new Error('Email middleware: No email service provided!')
  }

  /**
   * Email notifications are only applicable on mutations
   */
  const typeMap = schema.getTypeMap()
  const { Mutation } = typeMap
  const mutationFields = Mutation.getFields()

  const mutationEntries = Object.keys(mutationFields).reduce(
    (middlewareSchema, field) => {
      const serviceFieldEntry = emailService[field]
      if (!serviceFieldEntry) return middlewareSchema

      /* eslint-disable-next-line no-param-reassign */
      middlewareSchema[field] = serviceFieldEntry
      return middlewareSchema
    },
    {},
  )

  return {
    Mutation: mutationEntries,
  }
})

module.exports = generator
