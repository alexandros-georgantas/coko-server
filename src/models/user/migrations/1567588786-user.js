/* eslint-disable func-names */
/* eslint-disable no-console */

const logger = require('@pubsweet/logger')

exports.up = knex => {
  try {
    const teams = knex.schema
      .createTable('users', table => {
        table.uuid('id').primary()
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
        table.timestamp('updated', { useTz: true })

        table.boolean('admin').defaultTo(false)
        table.string('username')

        table.text('password_hash')
        table.text('password_reset_token')
        table.timestamp('password_reset_timestamp', { useTz: true })

        table.boolean('agreed_tc').notNullable().defaultTo(false)
        table.boolean('is_active').defaultTo(true)
        table.jsonb('affiliations')
        table.text('invitation_token')
        table.text('given_names')
        table.text('surname')
        table.text('title_pre')
        table.text('title_post')

        table.text('type').notNullable()

        table.unique('username')
      })
      .then(() => {
        console.log(' Adding extension via RAW.')

        knex.schema
          .raw('CREATE EXTENSION IF NOT EXISTS pgcrypto;')
          .then(function (resp) {
            // console.log(resp)
          })
          .catch(function (err) {
            console.log(err.stack)
          })
      })

    return teams
  } catch (e) {
    logger.error('Users: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('users')
