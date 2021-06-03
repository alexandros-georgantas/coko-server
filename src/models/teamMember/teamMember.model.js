const omit = require('lodash/omit')

const logger = require('@pubsweet/logger')
const PubsweetTeamMember = require('@pubsweet/model-team/src/team_member')

const { REVIEWER_STATUSES, TEAMS } = require('../../api/constants')

class TeamMember extends PubsweetTeamMember {
  static get schema() {
    return {
      type: 'object',
      required: ['teamId', 'userId'],
    }
  }

  static get relationMappings() {
    return omit(PubsweetTeamMember.relationMappings, 'alias')
  }

  static manuscriptFromMemberQuery(role, userId) {
    return this.query()
      .select('team_members.*', 'teams.role', 'manuscripts.id as manuscriptId')
      .leftJoin('teams', 'team_members.team_id', 'teams.id')
      .leftJoin('manuscripts', 'teams.object_id', 'manuscripts.id')
      .where({
        role,
        userId,
      })
  }

  static manuscriptVersionFromMemberQuery(role, userId, status) {
    if (!role || !Object.values(TEAMS).includes(role)) {
      throw new Error('No valid role provided')
    }

    let where = {
      role,
      userId,
    }

    if (status !== undefined) {
      where = {
        ...where,
        'team_members.status': status,
      }
    }

    return this.query()
      .select(
        'team_members.*',
        'teams.role',
        'manuscripts.id as manuscriptId',
        'manuscript_versions.id as manuscriptVersionId',
      )
      .leftJoin('teams', 'team_members.team_id', 'teams.id')
      .leftJoin(
        'manuscript_versions',
        'teams.object_id',
        'manuscript_versions.id',
      )
      .leftJoin(
        'manuscripts',
        'manuscript_versions.manuscript_id',
        'manuscripts.id',
      )
      .where(where)
  }

  static teamFromMemberQuery() {
    return this.query()
      .select('team_members.*', 'teams.global', 'teams.role')
      .leftJoin('teams', 'team_members.team_id', 'teams.id')
  }

  /**
   * Will find manuscripts ids based on user's role
   * @param role
   * @param userId
   * @returns {Promise<*>}
   */
  static async manuscriptIdsWithRole(role, userId) {
    if (!role || !Object.values(TEAMS).includes(role)) {
      throw new Error('No valid role provided')
    }

    if (!userId) {
      throw new Error('No user provided')
    }

    let manuscripts

    switch (role) {
      case TEAMS.AUTHOR:
        manuscripts = await this.manuscriptVersionFromMemberQuery(role, userId)
        break
      case TEAMS.REVIEWER:
        manuscripts = await this.manuscriptVersionFromMemberQuery(
          role,
          userId,
          REVIEWER_STATUSES.accepted,
        )
        break

      default: {
        manuscripts = await this.manuscriptFromMemberQuery(role, userId)
      }
    }

    return manuscripts.map(m => m.manuscriptId)
  }

  static async manuscriptVersionIdsWithRole(role, userId, status) {
    const manuscripts = await this.manuscriptVersionFromMemberQuery(
      role,
      userId,
      status,
    )

    return manuscripts.map(m => m.manuscriptVersionId)
  }

  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext)
    const trx = queryContext.transaction

    // eslint-disable-next-line global-require
    const { ChatThread, CuratorReview, Team } = require('@pubsweet/models')

    try {
      const team = await Team.query(trx).findById(this.teamId).throwIfNotFound()

      /**
       * When assigning a curator, if they don't already exist:
       *  - create a curator reviews for all versions of the manuscript
       *  - create a curator chat
       */
      if (!team.global && team.role === 'curator') {
        const manuscriptId = team.objectId
        const curatorId = this.userId

        await CuratorReview.createReviewsForManuscript(
          manuscriptId,
          curatorId,
          { trx },
        )

        await ChatThread.createCuratorThread(manuscriptId, curatorId, { trx })
      }
    } catch (e) {
      logger.error(
        'Team Member: After insert: Transaction failed! Rolling back...',
      )
      throw new Error(e)
    }
  }

  // `false` here would mean that they are already invited
  canInvite() {
    return !this.status || this.status === REVIEWER_STATUSES.added
  }

  // The inverse of canInvite
  hasBeenInvited() {
    return (
      this.status === REVIEWER_STATUSES.invited ||
      this.status === REVIEWER_STATUSES.accepted ||
      this.status === REVIEWER_STATUSES.rejected ||
      this.status === REVIEWER_STATUSES.revoked
    )
  }

  // Has been invited and the invitation has not been revoked or rejected
  hasActiveInvitation() {
    return (
      this.status === REVIEWER_STATUSES.invited ||
      this.status === REVIEWER_STATUSES.accepted
    )
  }
}

module.exports = TeamMember
