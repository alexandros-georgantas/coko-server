/* eslint-disable no-console */
const logger = require('@pubsweet/logger')

exports.up = knex => {
  try {
    return knex.schema
      .createTable('identities', table => {
        table.uuid('id').primary()
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
        table.timestamp('updated', { useTz: true })
        table.uuid('user_id').references('users.id').notNullable()
        table.text('type').notNullable()
        table.text('identifier')
        table.text('name')
        table.text('aff')
        table.jsonb('oauth')
        table.boolean('is_default')
        table.text('email').notNullable()
        table.text('orcid')
        table.boolean('is_confirmed').notNullable()
        table.text('confirmation_token')
        table.timestamp('confirmation_token_timestamp', { useTz: true })
        table.unique('email', 'unique_email')
        table.unique('confirmation_token', 'unique_confirmation_token')
      })
      .then(() => {
        knex.schema
          .raw(
            ' CREATE UNIQUE INDEX "is_default_idx" ON "identities" (is_default, user_id) WHERE is_default IS true;',
          )
          .then(function (resp) {
            // console.log(resp)
          })
          .catch(function (err) {
            console.log(err.stack)
          })
      })
  } catch (e) {
    logger.error('Identity: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('identities')
