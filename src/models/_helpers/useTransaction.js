const { BaseModel } = require('@coko/server')

const useTransaction = async (callback, options = {}) => {
  const { passedTrxOnly = false, trx } = options

  /**
   * Most common case (eg. useTransaction(callback))
   * No pre-defined transaction was provided.
   * Use transaction anyway.
   */

  if (!trx && !passedTrxOnly) {
    return BaseModel.transaction(async newtrx => callback(newtrx))
  }

  /**
   * I want to use a transaction only if one is provided through the options,
   * None was. Just run function without a transaction.
   */

  if (!trx && passedTrxOnly) return callback()

  /**
   * Transaction was passed from a parent.
   * Use passed transaction on current cb.
   */

  if (trx) return callback(trx)

  throw new Error('Use transaction: Invalid arguments!')
}

module.exports = useTransaction
