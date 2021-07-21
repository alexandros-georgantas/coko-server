/* eslint-disable no-console */
const logger = require('@pubsweet/logger')

exports.up = async knex => {
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
        table.text('provider')
        table.text('oauthAccessToken')
        table.text('oauthRefreshToken')
        table.boolean('is_default').defaultTo(false)
        table.text('email').notNullable()
        table.boolean('is_verified').notNullable().defaultTo(false)
        table.boolean('is_social')
        table.jsonb('profile_data')
        table.text('verification_token')
        table.timestamp('verification_token_timestamp', { useTz: true })
        table.unique('email', 'unique_email')
        table.unique('verification_token', 'unique_verification_token')
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

exports.down = async knex => knex.schema.dropTable('identities')
