const logger = require('@pubsweet/logger')

exports.up = async knex => {
  try {
    await knex.schema.alterTable('identities', table => {
      table.dropUnique(['email'], 'unique_email')
    })
    await knex.raw(
      'ALTER TABLE identities ADD CONSTRAINT unique_provider_email UNIQUE (provider, email);',
    )
    return true
  } catch (e) {
    logger.error(e)
    throw new Error(
      'Migration: Identity: require unique email per provider failed',
    )
  }
}

exports.down = async knex => {
  try {
    await knex.schema.alterTable('identities', table => {
      table.dropUnique(['provider', 'email'], 'unique_provider_email')
    })
    await knex.raw(
      'ALTER TABLE identities ADD CONSTRAINT unique_email UNIQUE (email);',
    )
    return true
  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Identity: require unique email failed')
  }
}
