const { logger } = require('@pubsweet/logger')

const BaseModel = require('../base.model')
const useTransaction = require('../useTransaction')

const {
  arrayOfStoredObjects,
  arrayOfStrings,
  stringNullable,
  stringNotEmpty,
  idNullable,
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
      required: ['name', 'storedObjects'],
      properties: {
        alt: stringNullable,
        description: stringNullable,
        name: stringNotEmpty,
        objectId: idNullable,
        storedObjects: arrayOfStoredObjects,
        objectType: stringNullable,
        referenceId: idNullable,
        tags: arrayOfStrings,
      },
    }
  }

  static async getEntityFiles(objectId, objectType, options = {}) {
    try {
      const { trx, ...rest } = options
      return useTransaction(
        async tr => {
          return File.find(
            { objectId, objectType },
            {
              trx: tr,
              ...rest,
            },
          )
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('File model: getEntityFiles failed', e)
      throw new Error(
        `File model: Cannot get files for entity with id ${objectId} and type ${objectType}`,
      )
    }
  }
}

module.exports = File
