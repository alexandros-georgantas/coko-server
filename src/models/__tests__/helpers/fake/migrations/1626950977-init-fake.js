exports.up = async knex => {
  try {
    return knex.schema.createTable('fakes', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      // table.increments('index')
      table.uuid('user_id').references('users.id')
      table.text('type').notNullable()
      table.text('status')
    })
  } catch (e) {
    throw new Error(`Fake: Initial: Migration failed! ${e}`)
  }
}

exports.down = async knex => knex.schema.dropTable('fakes')
