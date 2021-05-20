/* eslint-disable no-console */

const BaseModel = require('../BaseModel')

class Fake extends BaseModel {
  static doSomething() {
    console.log('doing something!')
  }
}

module.exports = Fake
