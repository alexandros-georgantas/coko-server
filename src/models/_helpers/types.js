const config = require('config')
const union = require('lodash/union')

const globalTeams = Object.values(config.get('teams.global'))
const nonGlobalTeams = Object.values(config.get('teams.nonGlobal'))
const allTeams = union(globalTeams, nonGlobalTeams)
const flattenAllTeamRoles = allTeams.map(team => team.role)
const flattenAllTeamDisplayNames = allTeams.map(team => team.displayName)

const alphaNumericStringNotNullable = {
  type: 'string',
  pattern: '^[a-zA-Z0-9]+',
}

const boolean = {
  type: 'boolean',
}

const booleanNullable = {
  type: ['boolean', 'null'],
}

const booleanDefaultFalse = {
  type: 'boolean',
  default: false,
}

const booleanDefaultTrue = {
  type: 'boolean',
  default: true,
}

const dateNotNullable = {
  type: ['string', 'object'],
  format: 'date-time',
}

const dateNullable = {
  type: ['string', 'object', 'null'],
  format: 'date-time',
}

const email = {
  type: 'string',
  format: 'email',
}

const id = {
  type: 'string',
  format: 'uuid',
}

const idNullable = {
  type: ['string', 'null'],
  format: 'uuid',
}

const integerPositive = {
  type: 'integer',
  minimum: 1,
}

const mimetype = {
  type: 'string',
  pattern:
    '^(application|audio|font|image|model|multipart|text|video)/[a-z0-9]+([-+.][a-z0-9]+)*$',
  // if you want to know why this is default, look at
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
  default: 'application/octet-stream',
}

const object = {
  type: 'object',
}

const objectNullable = {
  type: ['object', 'null'],
}

const password = {
  type: 'string',
  minLength: 8,
}

const string = {
  type: 'string',
}

const stringNotEmpty = {
  type: 'string',
  minLength: 1,
}

const stringNullable = {
  type: ['string', null],
}

const arrayOfIds = {
  type: 'array',
  items: id,
  default: [],
}

const arrayOfObjects = {
  type: 'array',
  items: object,
}

const arrayOfObjectsNullable = {
  type: ['array', 'null'],
  items: object,
}

const arrayOfStoredObjects = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['original', 'small', 'medium'] },
      key: stringNotEmpty,
      mimetype,
      extension: stringNotEmpty,
      metadata: {
        type: 'object',
        properties: {
          density: integerPositive,
          height: integerPositive,
          space: stringNotEmpty,
          width: integerPositive,
        },
      },
      size: integerPositive,
    },
  },
}

const arrayOfStrings = {
  type: 'array',
  items: stringNotEmpty,
  default: [],
}

const teamRoles = {
  type: 'string',
  enum: flattenAllTeamRoles,
}

const teamDisplayNames = {
  type: 'string',
  enum: flattenAllTeamDisplayNames,
}

module.exports = {
  alphaNumericStringNotNullable,
  arrayOfIds,
  arrayOfObjects,
  arrayOfObjectsNullable,
  arrayOfStoredObjects,
  arrayOfStrings,
  boolean,
  booleanNullable,
  booleanDefaultFalse,
  booleanDefaultTrue,
  dateNotNullable,
  dateNullable,
  email,
  id,
  idNullable,
  integerPositive,
  mimetype,
  object,
  objectNullable,
  password,
  string,
  stringNotEmpty,
  stringNullable,
  teamRoles,
  teamDisplayNames,
}
