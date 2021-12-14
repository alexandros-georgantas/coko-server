const { v4: uuid } = require('uuid')
const { File } = require('../index')

const { deleteFiles } = require('../file/file.controller')

const clearDb = require('./_clearDb')

describe('File Controller', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = File.knex()
    knex.destroy()
  })

  it('deletes files', async () => {
    const newFile1 = await File.insert({
      name: 'test.txt',
      objectId: uuid(),
      objectType: 'test',
      storedObjects: [
        {
          type: 'original',
          mimetype: 'text/plain',
          extension: 'txt',
          metadata: null,
          size: 25,
        },
      ],
    })

    const newFile2 = await File.insert({
      name: 'test2.txt',
      objectId: uuid(),
      objectType: 'test',
      storedObjects: [
        {
          type: 'original',
          mimetype: 'text/plain',
          extension: 'txt',
          metadata: null,
          size: 25,
        },
      ],
    })

    const affectedRows = await deleteFiles([newFile1.id, newFile2.id])

    expect(affectedRows).toBe(2)
  })
})
