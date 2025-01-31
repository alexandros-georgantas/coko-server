const config = require('config')
const union = require('lodash/union')

const globalTeams = Object.values(
  (config.has('teams.global') && config.get('teams.global')) || {},
)

const nonGlobalTeams = Object.values(
  (config.has('teams.nonGlobal') && config.get('teams.nonGlobal')) || {},
)

const allTeams = union(globalTeams, nonGlobalTeams)

const flattenAllTeamRoles = allTeams.map(team => team.role)
const flattenAllTeamDisplayNames = allTeams.map(team => team.displayName)

module.exports = {
  globalTeams,
  nonGlobalTeams,
  rolesEnum: flattenAllTeamRoles,
  displayNamesEnum: flattenAllTeamDisplayNames,
}
