const PubsweetBaseModel = require('@pubsweet/base-model')
const { logger } = require('@pubsweet/logger')
const useTransaction = require('../useTransaction')

class BaseModel extends PubsweetBaseModel {
  static async findById(id, options = {}) {
    try {
      if (!id) {
        throw new Error('Base model: id was not provided')
      }

      const { trx } = options

      return useTransaction(
        async tr => this.query(tr).findById(id).throwIfNotFound(),
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: findById failed', e)
      throw new Error(e)
    }
  }

  static async findOne(data, options = {}) {
    try {
      if (!data) {
        throw new Error('Base model: data was not provided')
      }

      const { trx } = options

      return useTransaction(
        async tr => this.query(tr).findOne(data).throwIfNotFound(),
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: findOne failed', e)
      throw new Error(e)
    }
  }

  static async insert(data, options = {}) {
    try {
      const { trx } = options

      if (!data) {
        throw new Error('Base model: data was not provided')
      }

      return useTransaction(async tr => this.query(tr).insert(data), {
        trx,
      })
    } catch (e) {
      logger.error('Base model: insert failed', e)
      throw new Error(e)
    }
  }

  static async patch(data, options = {}) {
    try {
      if (!data) {
        throw new Error('Base model: data was not provided')
      }

      const { trx } = options

      return useTransaction(
        async tr => this.query(tr).patch(data).throwIfNotFound(),
        {
          trx,
        },
      )
    } catch (e) {
      logger.error('Base model: patch failed', e)
      throw new Error(e)
    }
  }

  static async patchAndFetchById(id, data, options = {}) {
    try {
      if (!id) {
        throw new Error('Base model: id was not provided')
      }

      if (!data) {
        throw new Error('Base model: data was not provided')
      }

      const { trx } = options

      return useTransaction(
        async tr =>
          this.query(tr).patchAndFetchById(id, data).throwIfNotFound(),
        {
          trx,
        },
      )
    } catch (e) {
      logger.error('Base model: patchAndFetchById failed', e)
      throw new Error(e)
    }
  }

  static async update(data, options = {}) {
    try {
      if (!data) {
        throw new Error('Base model: data was not provided')
      }

      const { trx } = options

      return useTransaction(
        async tr => this.query(tr).update(data).throwIfNotFound(),
        {
          trx,
        },
      )
    } catch (e) {
      logger.error('Base model: update failed', e)
      throw new Error(e)
    }
  }

  static async updateAndFetchById(id, data, options = {}) {
    try {
      if (!id) {
        throw new Error('Base model: id was not provided')
      }

      if (!data) {
        throw new Error('Base model: data was not provided')
      }

      const { trx } = options

      return useTransaction(
        async tr =>
          this.query(tr).updateAndFetchById(id, data).throwIfNotFound(),
        {
          trx,
        },
      )
    } catch (e) {
      logger.error('Base model: updateAndFetchById failed', e)
      throw new Error(e)
    }
  }

  static async deleteById(id, options = {}) {
    try {
      if (!id) {
        throw new Error('Base model: id was not provided')
      }

      const { trx } = options
      return useTransaction(
        async tr => this.query(tr).deleteById(id).throwIfNotFound(),
        {
          trx,
        },
      )
    } catch (e) {
      logger.error('Base model: deleteById failed', e)
      throw new Error(e)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async save() {
    logger.error('User model: save method has been disabled')
  }

  // Email does not exist on User, but on Identity
  static findByEmail() {
    logger.error('User model: findByEmail method has been disabled')
  }

  // Owners is not used
  static ownersWithUsername(object) {
    logger.error('User model: ownersWithUsernames method has been disabled')
  }

  static findByUsername(username) {
    logger.error('Base model: findByUsername method has been disabled')
  }

  static async find(id, options) {
    logger.error('Base model: find method has been disabled')
  }

  static findByField(field, value) {
    logger.error('Base model: findByField method has been disabled')
  }

  static async findOneByField(field, value) {
    logger.error('Base model: findOneByField method has been disabled')
  }

  static async all() {
    logger.error('Base model: all method has been disabled')
  }

  // eslint-disable-next-line class-methods-use-this
  setOwners() {
    // FIXME: this is overriden to be a no-op, because setOwners() is called by
    // the API on create for all entity types and setting `owners` on a User is
    // not allowed. This should instead be solved by having separate code paths
    // in the API for different entity types.
  }
}
module.exports = BaseModel
