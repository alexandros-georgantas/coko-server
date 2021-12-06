const BaseModel = require('../base.model')

const {
  arrayOfStoredObjects,
  arrayOfStringsNotEmpty,
  id,
  stringNotEmpty,
  string,
} = require('../_helpers/types')

class File extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'file'
  }

  static get tableName() {
    return 'File'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['name', 'objectKey'],
      properties: {
        alt: string,
        description: string,
        name: stringNotEmpty,
        objectId: id,
        storedObjects: arrayOfStoredObjects,
        objectType: string,
        referenceId: id,
        tags: arrayOfStringsNotEmpty,
      },
    }
  }
}

module.exports = File
