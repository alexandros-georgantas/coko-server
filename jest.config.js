module.exports = {
  collectCoverage: false,
  maxWorkers: 1,
  globalSetup: '<rootDir>/src/models/__tests__/_setup.js',
  testEnvironment: 'node',
  testRegex: '(/src/.*\\.test\\.js$|/__tests__/.*\\.test\\.js$)',
}
