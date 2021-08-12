const logger = require('@pubsweet/logger')

exports.up = knex => {
  try {
    return knex.schema.createTable('team_members', table => {
      table.uuid('id').primary()
      table.timestamp('created').defaultTo(knex.fn.now())
      table.timestamp('updated').defaultTo(knex.fn.now())
      table.string('status')
      table
        .uuid('team_id')
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.unique(['team_id', 'user_id'])
    })
  } catch (e) {
    logger.error('Team Members: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('team_members')
