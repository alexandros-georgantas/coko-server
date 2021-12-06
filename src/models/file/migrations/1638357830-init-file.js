/* eslint-disable no-console */
const logger = require('@pubsweet/logger')

exports.up = async knex => {
  try {
    return knex.schema.createTable('files', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      table.text('type').notNullable()
      table.text('name').notNullable()
      table.jsonb('storedObjects').notNullable()
      table.jsonb('tags').defaultTo([])
      table.uuid('referenceId')
      table.uuid('objectId')
      table.text('objectType')
      table.text('alt')
      table.text('description')
    })
  } catch (e) {
    logger.error('File: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = async knex => knex.schema.dropTable('files')
