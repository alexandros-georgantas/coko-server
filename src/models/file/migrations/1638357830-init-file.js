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
      table.uuid('referenceId').nullable()
      table.uuid('objectId').nullable()
      table.text('alt').nullable()
      table.text('uploadStatus').nullable()
      table.text('caption').nullable()
    })
  } catch (e) {
    logger.error('File: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = async knex => knex.schema.dropTable('files')
