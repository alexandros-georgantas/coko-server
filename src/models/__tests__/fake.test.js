/* eslint-disable no-console */

const Fake = require('../fake/fake.model')
const clearDb = require('./_clearDb')

describe('Fake it', () => {
  beforeAll(() => clearDb())
  afterEach(() => clearDb())

  afterAll(() => {
    const knex = Fake.knex()
    knex.destroy()
  })

  test('this is a fake test', () => {
    console.log('hello this is it')

    Fake.doSomething()

    expect(true).toBe(true)
  })
})
