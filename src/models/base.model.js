const PubsweetBaseModel = require('@pubsweet/base-model')
const { logger } = require('@pubsweet/logger')
const useTransaction = require('./useTransaction')

class BaseModel extends PubsweetBaseModel {
  static async find(data, options = {}) {
    try {
      const { trx, related, orderBy, page, pageSize } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (orderBy) {
            queryBuilder = queryBuilder.orderBy(orderBy)
          }

          if (
            (Number.isInteger(page) && !Number.isInteger(pageSize)) ||
            (!Number.isInteger(page) && Number.isInteger(pageSize))
          ) {
            throw new Error(
              'both page and pageSize integers needed for paginated results',
            )
          }

          if (Number.isInteger(page) && Number.isInteger(pageSize)) {
            if (page < 0) {
              throw new Error(
                'invalid index for page (page should be an integer and greater than or equal to 0)',
              )
            }

            if (pageSize <= 0) {
              throw new Error(
                'invalid size for pageSize (pageSize should be an integer and greater than 0)',
              )
            }

            queryBuilder = queryBuilder.page(page, pageSize)
          }

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const result = await queryBuilder.where(data)

          const { results, total } = result

          return {
            result: page !== undefined ? results : result,
            totalCount: total || result.length,
          }
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

  static async findByIds(ids, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const result = await queryBuilder.findByIds(ids)

          if (result.length < ids.length) {
            const delta = ids.filter(
              id => !result.map(res => res.id).includes(id),
            )

            throw new Error(`id ${delta} not found`)
          }

          return result
        },

        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: findByIds failed', e)
      throw new Error(e)
    }
  }

  static async findById(id, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.findById(id).throwIfNotFound()
        },
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
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.findOne(data)
        },
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
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.insert(data)
        },

        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: insert failed', e)
      throw new Error(e)
    }
  }

  // INSTANCE METHOD
  async patch(data, options = {}) {
    try {
      const { trx } = options

      if (!data) {
        throw new Error('Patch is empty')
      }

      return useTransaction(async tr => this.$query(tr).patch(data), {
        trx,
        passedTrxOnly: true,
      })
    } catch (e) {
      logger.error('Base model: patch failed', e)
      throw new Error(e)
    }
  }

  static async patchAndFetchById(id, data, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.patchAndFetchById(id, data).throwIfNotFound()
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: patchAndFetchById failed', e)
      throw new Error(e)
    }
  }

  // INSTANCE METHOD
  async update(data, options = {}) {
    try {
      const { trx } = options

      if (!data) {
        throw new Error('Patch is empty')
      }

      return useTransaction(async tr => this.$query(tr).update(data), {
        trx,
        passedTrxOnly: true,
      })
    } catch (e) {
      logger.error('Base model: update failed', e)
      throw new Error(e)
    }
  }

  static async updateAndFetchById(id, data, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.updateAndFetchById(id, data).throwIfNotFound()
        },
        {
          trx,
          passedTrxOnly: true,
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
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: deleteById failed', e)
      throw new Error(e)
    }
  }

  static async deleteByIds(ids, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const result = await this.query(tr)
            .delete()
            .whereIn('id', ids)
            .returning('id')

          if (result.length < ids.length) {
            const delta = ids.filter(
              id => !result.map(res => res.id).includes(id),
            )

            throw new Error(`id ${delta} not found`)
          }

          return result.map(u => u.id)
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: deleteByIds failed', e)
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
