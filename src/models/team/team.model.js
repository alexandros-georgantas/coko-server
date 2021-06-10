const union = require('lodash/union')
const { ValidationError } = require('objection')
const { logger } = require('@pubsweet/logger')
const { Team: PubsweetTeam } = require('@pubsweet/models')
const config = require('config')
const TeamMember = require('../teamMember/teamMember.model')

const { booleanDefaultFalse } = require('../_helpers/types')
const useTransaction = require('../../useTransaction')

const globalTeams = Object.values(config.get('teams.global'))
const nonGlobalTeams = Object.values(config.get('teams.nonglobal'))
const allTeams = union(globalTeams, nonGlobalTeams)

class Team extends PubsweetTeam {
  static get schema() {
    return {
      type: 'object',
      required: ['role'],
      properties: {
        role: {
          type: 'string',
          enum: allTeams,
        },
        global: booleanDefaultFalse,
      },
    }
  }

  /* eslint-disable-next-line class-methods-use-this */
  $beforeValidate(jsonSchema, json) {
    let validTeamChoice
    const { global, role } = json

    if (global) {
      validTeamChoice = globalTeams.includes(role)
    } else {
      validTeamChoice = nonGlobalTeams.includes(role)
    }

    if (!validTeamChoice) {
      const errorMessage = `Role ${role} is not valid for ${
        global ? '' : 'non-'
      }global teams`

      throw new ValidationError({
        type: 'ModelValidation',
        message: errorMessage,
      })
    }

    return jsonSchema
  }

  static async findAllGlobalTeams() {
    return this.query().where({
      global: true,
    })
  }

  static async findGlobalTeamByRole(role) {
    return this.query().findOne({
      role,
      global: true,
    })
  }

  static async findTeamByRoleAndObject(role, objectId) {
    return this.query().findOne({
      role,
      objectId,
    })
  }

  /**
   * Members should be an array of user ids
   */
  static async updateMembershipByTeamId(teamId, members, options = {}) {
    const queries = async trx => {
      const existingMembers = await TeamMember.query(trx).where({ teamId })
      const existingMemberUserIds = existingMembers.map(m => m.userId)

      // add members that exist in the incoming array, but not in the db
      const toAdd = members.filter(id => !existingMemberUserIds.includes(id))
      await Promise.all(
        toAdd.map(userId => Team.addMember(teamId, userId, { trx })),
      )

      // delete members that exist in the db, but not in the incoming array
      const toDelete = existingMemberUserIds.filter(id => !members.includes(id))
      await Promise.all(
        toDelete.map(userId => Team.removeMember(teamId, userId, { trx })),
      )
    }

    return useTransaction(queries, { trx: options.trx })
  }

  static async addMember(teamId, userId, options = {}) {
    const data = {
      teamId,
      userId,
    }

    if (options.status) data.status = options.status

    const add = async trx => TeamMember.query(trx).insert(data)

    const trxOptions = {
      trx: options.trx,
    }

    try {
      return useTransaction(add, trxOptions)
    } catch (e) {
      logger.error('Team Model: Add member: Insert failed!')
      throw new Error(e)
    }
  }

  static async removeMember(teamId, userId, options = {}) {
    const remove = async trx => {
      const team = await Team.query(trx).findById(teamId)

      await TeamMember.query(trx).delete().where({
        teamId,
        userId,
      })

      /**
       * If a user is removed from a global team, they should also be unassigned
       * from all objects that they have that role on.
       * eg. you cannot be an editor of X if you are not an editor anymore
       */
      if (team.global) {
        // TO DO -- standardize with 'global' prefix
        // XXXX get rid of this!
        // Make a real two way mapping between nonglobal and global roles.
        const mapper = {
          editors: 'editor',
          scienceOfficers: 'scienceOfficer',
          globalCurator: 'curator',
          globalSectionEditor: 'sectionEditor',
        }

        const membershipsToDelete = await TeamMember.query(trx)
          .leftJoin('teams', 'team_members.team_id', 'teams.id')
          .where({
            role: mapper[team.role],
            userId,
          })

        await Promise.all(
          membershipsToDelete.map(membership =>
            TeamMember.query(trx).deleteById(membership.id),
          ),
        )
      }
    }

    try {
      return useTransaction(remove, { trx: options.trx })
    } catch (e) {
      logger.error(
        'Team model: Remove member: Transaction failed! Rolling back...',
      )
      throw new Error(e)
    }
  }
}

module.exports = Team
