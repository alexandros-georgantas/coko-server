const logger = require('@pubsweet/logger')

exports.up = knex => {
  try {
    return knex.schema.createTable('chat_related_objects', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })

      table.timestamp('timestamp', { useTz: true })

      table.uuid('foreign_key_id')

      table.text('type')
    })
  } catch (e) {
    logger.error('Chat related objects: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('chat_related_objects')
