// /* eslint-disable no-console */
// const logger = require('@pubsweet/logger')

// exports.up = async knex => {
//   try {
//     return knex.schema.createTable('service_credentials', table => {
//       table.uuid('id').primary()
//       table
//         .timestamp('created', { useTz: true })
//         .notNullable()
//         .defaultTo(knex.fn.now())
//       table.timestamp('updated', { useTz: true })
//       table.text('type').notNullable()
//       table.text('name').notNullable()
//       table.text('accessToken').nullable()
//     })
//   } catch (e) {
//     logger.error('Service Credentials: Initial: Migration failed!')
//     throw new Error(e)
//   }
// }

// exports.down = async knex => knex.schema.dropTable('service_credentials')
