const omit = require('lodash/omit')

const PubsweetTeamMember = require('@pubsweet/model-team/src/team_member')

const { REVIEWER_STATUSES } = require('../../api/constants')

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

  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext)
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
