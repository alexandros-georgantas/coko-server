exports.up = knex => {
  try {
    return knex.schema.createTable('fake_table', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
    })
  } catch (e) {
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('fake_table')
