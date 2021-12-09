const { logger } = require('@pubsweet/logger')

const BaseModel = require('../base.model')
const useTransaction = require('../useTransaction')

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
