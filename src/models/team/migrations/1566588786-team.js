/* eslint-disable func-names */
/* eslint-disable no-console */

const logger = require('@pubsweet/logger')

exports.up = knex => {
  try {
    const teams = knex.schema
      .createTable('teams', table => {
        table.uuid('id').primary()
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
        table.timestamp('updated', { useTz: true })
        table.uuid('object_id')
        table.string('object_type')
        table.text('displayName').notNullable()
        table.text('role').notNullable()
        table.boolean('global').defaultTo(false)
        table.text('type').notNullable()
      })
      .then(() => {
        knex.schema
          .raw(
            'CREATE UNIQUE INDEX "unique_global_team" ON "teams" (role) WHERE "global" = true;',
          )
          .then(resp => {
            // console.log(resp)
          })
          .catch(err => {
            logger.error(err.stack)
          })

        knex.schema
          .raw(
            'CREATE UNIQUE INDEX "unique_non_global_team_per_object" ON "teams" (role, object_id) WHERE "global" = false;',
          )
          .then(resp => {
            // console.log(resp)
          })
          .catch(err => {
            logger.error(err.stack)
          })

        knex.schema
          .raw(
            'ALTER TABLE "teams" ADD CONSTRAINT "global_teams_must_not_have_associated_objects_other_teams_must_have_them" CHECK ( (global = true AND object_id IS NULL AND object_type IS NULL) or (global = false AND object_id IS NOT NULL AND object_type IS NOT NULL));',
          )
          .then(resp => {
            // console.log(resp)
          })
          .catch(err => {
            logger.error(err.stack)
          })
      })

    return teams
  } catch (e) {
    logger.error('Teams: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = knex => knex.schema.dropTable('teams')
