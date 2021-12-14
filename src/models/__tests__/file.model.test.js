const { v4: uuid } = require('uuid')
const { File } = require('../index')
const { createFilesForObjectId } = require('./helpers/files')

const clearDb = require('./_clearDb')

describe('File model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = File.knex()
    knex.destroy()
  })

  it('fetches all files of given objectId', async () => {
    const objectId = uuid()
    const objectType = 'imaginary'
    const files = await createFilesForObjectId(objectId, objectType)

    const dbFiles = await File.getEntityFiles(objectId, objectType)
    const { result } = dbFiles

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: files[0].id }),
        expect.objectContaining({ id: files[1].id }),
      ]),
    )
  })
})
