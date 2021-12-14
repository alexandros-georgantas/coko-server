const { File } = require('../../index')

const createFilesForObjectId = async (objectId, objectType) => {
  try {
    const res = []

    const file1 = await File.insert({
      name: '1.txt',
      storedObjects: [
        {
          type: 'original',
          mimetype: 'text/plain',
          extension: 'txt',
          metadata: null,
          size: 25,
        },
      ],
      objectId,
      objectType,
    })

    const file2 = await File.insert({
      name: '2.txt',
      storedObjects: [
        {
          type: 'original',
          mimetype: 'text/plain',
          extension: 'txt',
          metadata: null,
          size: 25,
        },
      ],
      objectId,
      objectType,
    })

    res.push(file1)
    res.push(file2)

    return res
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  createFilesForObjectId,
}
