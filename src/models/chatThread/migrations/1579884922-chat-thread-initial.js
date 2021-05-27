const logger = require('@pubsweet/logger')

exports.up = knex => {
  try {
    return knex.schema.createTable('chat_threads', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })

      table.uuid('user_id').references('users.id')

      table.uuid('related_object_id').references('chat_related_objects.id').notNullable()

      table
        .enu('chat_type', ['scienceOfficer', 'reviewer', 'author', 'curator'])
        .notNullable()

      table.text('type')
    })
  } catch (e) {
    logger.error('Chat Thread: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('chat_threads')
