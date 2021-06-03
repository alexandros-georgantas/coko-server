const REVIEWER_STATUSES = {
  accepted: 'acceptedInvitation',
  added: 'notInvited',
  invited: 'invited',
  rejected: 'rejectedInvitation',
  revoked: 'invitationRevoked',
}

const TEAMS = Object.freeze({
  EDITOR: 'editor',
  AUTHOR: 'author',
  REVIEWER: 'reviewer',
  SCIENCE_OFFICER: 'scienceOfficer',
  SECTION_EDITOR: 'sectionEditor',
  CURATOR: 'curator',
})

const GLOBAL_TEAMS = Object.freeze({
  EDITORS: 'editors',
  SCIENCE_OFFICERS: 'scienceOfficers',
  GLOBAL_SECTION_EDITOR: 'globalSectionEditor',
  GLOBAL_CURATOR: 'globalCurator',
})

module.exports = { REVIEWER_STATUSES, TEAMS, GLOBAL_TEAMS }
