const fs = require('fs-extra')
const path = require('path')

const {
  connectToFileStorage,
  healthCheck,
  upload,
  getURL,
  list,
  download,
} = require('../fileStorage')

const { uploadOneFile, cleanBucket } = require('./helpers/helpers')

describe('File Storage Service', () => {
  beforeAll(() => {
    connectToFileStorage()
  })

  beforeEach(() => cleanBucket())

  afterAll(() =>
    fs.remove(
      path.join(process.cwd(), 'src', 'services', '__tests__', 'files', 'temp'),
    ),
  )

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
    const storedObject = await upload(fileStream, 'helloWorld.txt')
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
    const storedObject = await upload(fileStream, 'test.jpg')
    expect(storedObject).toHaveLength(3)
  })

  it('provides signed URLs for given operation and object key', async () => {
    const file = await uploadOneFile()
    const { key } = file
    const signed = await getURL(key)
    expect(signed).toBeDefined()
  })

  it('provides a list of all the files of the bucket', async () => {
    const file = await uploadOneFile()
    const { key } = file
    const files = await list()
    expect(files.Contents).toHaveLength(1)
    expect(files.Contents[0].Key).toEqual(key)
  })

  it('downloads locally the given file', async () => {
    const file = await uploadOneFile()
    fs.ensureDir(
      path.join(process.cwd(), 'src', 'services', '__tests__', 'files', 'temp'),
    )

    const tempPath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'temp',
      `${file.key}`,
    )

    await download(file.key, tempPath)
    expect(fs.existsSync(tempPath)).toBe(true)
  })
})
