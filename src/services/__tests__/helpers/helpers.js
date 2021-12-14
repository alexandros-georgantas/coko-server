const fs = require('fs-extra')
const path = require('path')

const {
  uploadFile,
  listFiles,
  deleteRemoteFiles,
} = require('../../objectStorage')

const uploadOneFile = async () => {
  const filePath = path.join(
    process.cwd(),
    'src',
    'services',
    '__tests__',
    'files',
    'helloWorld.txt',
  )

  const fileStream = fs.createReadStream(filePath)
  const file = await uploadFile(fileStream, 'helloWorld.txt')
  return file[0]
}

const cleanBucket = async () => {
  const allFiles = await listFiles()
  const { Contents } = allFiles
  const fileKeys = Contents.map(file => file.Key)

  if (fileKeys.length > 0) {
    return deleteRemoteFiles(fileKeys)
  }

  return true
}

module.exports = { uploadOneFile, cleanBucket }
