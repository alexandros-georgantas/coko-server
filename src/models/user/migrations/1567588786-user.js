/* eslint-disable func-names */
/* eslint-disable no-console */

const logger = require('@pubsweet/logger')

exports.up = async knex => {
  try {
    return knex.schema.createTable('users', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      table.string('username')
      table.text('password_hash')
      table.text('password_reset_token')
      table.timestamp('password_reset_timestamp', { useTz: true })
      table.boolean('agreed_tc').notNullable().defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.text('invitation_token')
      table.timestamp('invitation_token_timestamp', { useTz: true })
      table.text('given_names')
      table.text('surname')
      table.text('title_pre')
      table.text('title_post')
      table.text('type').notNullable()
      table.unique('username')
    })
  } catch (e) {
    logger.error('Users: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = async knex => knex.schema.dropTable('users')
