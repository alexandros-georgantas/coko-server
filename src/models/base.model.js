const PubsweetBaseModel = require('@pubsweet/base-model')
const { logger } = require('@pubsweet/logger')
const useTransaction = require('./useTransaction')

class BaseModel extends PubsweetBaseModel {
  static async find(data, options = {}) {
    try {
      const { trx, related, orderBy, limit, offset, count } = options

      return useTransaction(
        async tr => {
          if (!count) {
            return this.query(tr)
              .skipUndefined()
              .where(data)
              .orderBy(orderBy)
              .limit(limit)
              .offset(offset)
              .withGraphFetched(related)
          }

          const totalCount = await this.query(tr)
            .skipUndefined()
            .where(data)
            .count(count)

          const entries = await this.query(tr)
            .skipUndefined()
            .where(data)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset)
            .withGraphFetched(related)

          return { totalCount: parseInt(totalCount[0].count, 10), entries }
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: find failed', e)
      throw new Error(e)
    }
  }

  static async count(count, options = {}) {
    try {
      const { trx } = options

      return useTransaction(
        async tr => this.query(tr).skipUndefined().where({}).count(count),
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: count failed', e)
      throw new Error(e)
    }
  }

  static async findById(id, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr =>
          this.query(tr)
            .skipUndefined()
            .findById(id)
            .withGraphFetched(related)
            .throwIfNotFound(),

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
      const { trx, related } = options

      return useTransaction(
        async tr =>
          this.query(tr)
            .skipUndefined()
            .findOne(data)
            .withGraphFetched(related)
            .throwIfNotFound(),
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
      const { trx, related } = options

      return useTransaction(
        async tr =>
          this.query(tr).skipUndefined().insert(data).withGraphFetched(related),
        {
          trx,
        },
      )
    } catch (e) {
      logger.error('Base model: insert failed', e)
      throw new Error(e)
    }
  }

  static async patch(data, options = {}) {
    try {
      const { trx } = options

      return useTransaction(
        async tr =>
          this.query(tr).skipUndefined().patch(data).throwIfNotFound(),
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
      const { trx, related } = options

      return useTransaction(
        async tr =>
          this.query(tr)
            .skipUndefined()
            .patchAndFetchById(id, data)
            .withGraphFetched(related)
            .throwIfNotFound(),
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
      const { trx, related } = options

      return useTransaction(
        async tr =>
          this.query(tr)
            .skipUndefined()
            .update(data)
            .withGraphFetched(related)
            .throwIfNotFound(),
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
      const { trx, related } = options

      return useTransaction(
        async tr =>
          this.query(tr)
            .skipUndefined()
            .updateAndFetchById(id, data)
            .withGraphFetched(related)
            .throwIfNotFound(),
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

  /* eslint-disable */
  save() {
    throw new Error('Base model: save method has been disabled')
  }

  saveGraph(opts = {}) {
    throw new Error('Base model: saveGraph method has been disabled')
  }

  async _save(insertAndFetch, updateAndFetch, trx) {
    throw new Error('Base model: _save method has been disabled')
  }

  _updateProperties(properties) {
    throw new Error('Base model: _updateProperties method has been disabled')
  }

  updateProperties(properties) {
    throw new Error('Base model: updateProperties method has been disabled')
  }

  setOwners(owners) {
    throw new Error('Base model: setOwners method has been disabled')
  }

  static findByField(field, value) {
    throw new Error('Base model: findByField method has been disabled')
  }

  static async findOneByField(field, value) {
    throw new Error('Base model: findOneByField method has been disabled')
  }

  static async all() {
    throw new Error('Base model: all method has been disabled')
  }

  async delete() {
    throw new Error('Base model: delete method has been disabled')
  }
}
module.exports = BaseModel
