const union = require('lodash/union')
const { ValidationError } = require('objection')
const { logger } = require('@pubsweet/logger')

const config = require('config')

const BaseModel = require('../BaseModel')

const { booleanDefaultFalse } = require('../_helpers/types')
const useTransaction = require('../../useTransaction')

const globalTeams = Object.values(config.get('teams.global'))
const nonGlobalTeams = Object.values(config.get('teams.nonglobal'))
const allTeams = union(globalTeams, nonGlobalTeams)

class Team extends BaseModel {
  constructor(properties) {
    super(properties)

    this.type = 'team'
  }

  static get tableName() {
    return 'teams'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['role'],
      properties: {
        objectId: { type: ['string', 'null'], format: 'uuid' },
        objectType: { type: ['string', 'null'] },
        name: { type: 'string' },
        owners: {
          type: ['array', 'null'],
          items: { type: 'string', format: 'uuid' },
        },
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
    /* eslint-disable-next-line global-require, no-shadow */
    const { Team, TeamMember } = require('@pubsweet/models')

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
    /* eslint-disable-next-line global-require, no-shadow */
    const { TeamMember } = require('@pubsweet/models')

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
    /* eslint-disable-next-line global-require, no-shadow */
    const { TeamMember } = require('@pubsweet/models')

    const remove = async trx => {
      await TeamMember.query(trx).delete().where({
        teamId,
        userId,
      })
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
