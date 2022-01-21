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

const object = {
  type: 'object',
}

const objectNullable = {
  type: ['object', 'null'],
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

const arrayOfStrings = {
  type: 'array',
  items: stringNotEmpty,
  default: [],
}

module.exports = {
  alphaNumericStringNotNullable,
  arrayOfIds,
  arrayOfObjects,
  arrayOfObjectsNullable,
  arrayOfStrings,
  boolean,
  booleanNullable,
  booleanDefaultFalse,
  booleanDefaultTrue,
  dateNotNullable,
  dateNullable,
  id,
  idNullable,
  integerPositive,
  object,
  objectNullable,
  string,
  stringNotEmpty,
  stringNullable,
}
