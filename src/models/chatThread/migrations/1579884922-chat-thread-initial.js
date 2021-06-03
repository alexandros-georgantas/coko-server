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

      table.uuid('team_id').references('teams.id')

      table.uuid('related_object_id').notNullable()

      table.string('chat_type').notNullable()

      table.text('type')
    })
  } catch (e) {
    logger.error('Chat Thread: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('chat_threads')
