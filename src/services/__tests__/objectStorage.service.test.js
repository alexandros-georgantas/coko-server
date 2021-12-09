const fs = require('fs-extra')
const path = require('path')
const { healthCheck, uploadFile } = require('../objectStorage')

describe('Object Storage Service', () => {
  it('communicates with file server', async () => {
    const fileServerHealth = await healthCheck()
    expect(fileServerHealth).toBeDefined()
  })

  it('uploads a file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'helloWorld.txt',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await uploadFile(fileStream, 'helloWorld.txt')
    expect(storedObject).toHaveLength(1)
  })

  it('uploads an image file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.jpg',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await uploadFile(fileStream, 'test.jpg')
    expect(storedObject).toHaveLength(3)
  })
})
