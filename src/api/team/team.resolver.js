/* eslint-disable no-param-reassign */
const eager = '[members.[user]]'

const resolvers = {
  Query: {
    team(_, { id }, ctx) {
      return ctx.connectors.Team.fetchOne(id, ctx, { eager })
    },
    teams(_, { where }, ctx) {
      where = where || {}

      if (where.users) {
        const { users } = where
        delete where.users
        // eslint-disable-next-line no-underscore-dangle
        where._relations = [{ relation: 'users', ids: users }]
      }

      return ctx.connectors.Team.fetchAll(where, ctx, { eager })
    },
  },

  Mutation: {
    deleteTeam(_, { id }, ctx) {
      return ctx.connectors.Team.delete(id, ctx)
    },
    createTeam(_, { input }, ctx) {
      const options = {
        relate: ['members.user'],
        unrelate: ['members.user'],
        allowGraph: '[members]',
        eager: '[members.[user.teams]]',
      }

      return ctx.connectors.Team.create(input, ctx, options)
    },
    updateTeam(_, { id, input }, ctx) {
      return ctx.connectors.Team.update(id, input, ctx, {
        unrelate: false,
        eager: 'members.user.teams',
      })
    },
  },
  User: {
    teams: (parent, _, ctx) =>
      ctx.connectors.User.fetchRelated(parent.id, 'teams', undefined, ctx),
  },
  Team: {
    members(team, { where }, ctx) {
      return ctx.connectors.Team.fetchRelated(team.id, 'members', where, ctx)
    },
    object(team, vars, ctx) {
      const { objectId, objectType } = team
      return objectId && objectType ? { objectId, objectType } : null
    },
  },
  TeamMember: {
    user(teamMember, vars, ctx) {
      return ctx.connectors.TeamMember.fetchRelated(
        teamMember.id,
        'user',
        undefined,
        ctx,
      )
    },
  },
}

module.exports = { resolvers }
