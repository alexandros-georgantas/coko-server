const logger = require('@pubsweet/logger')

exports.up = knex => {
  try {
    return knex.schema.createTable('chat_messages', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })

      table.uuid('chat_thread_id').references('chat_threads.id').notNullable()

      table.uuid('user_id').references('users.id').notNullable()
      table.boolean('is_deleted').defaultTo(false)
      table.jsonb('mentions').defaultTo([])
      table.text('content').notNullable()

      table.text('type').notNullable()
    })
  } catch (e) {
    logger.error('Chat message: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('chat_messages')
