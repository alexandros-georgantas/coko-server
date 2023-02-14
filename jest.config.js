module.exports = {
  collectCoverage: false,
  // collectCoverageFrom: [
  //   '<rootDir>/src/models/**/*.model.js',
  //   '<rootDir>/src/models/**/*.controller.js',
  //   '<rootDir>/src/models/useTransaction.js',
  //   '!<rootDir>/src/models/__tests__/helpers/**',
  // ],
  coverageDirectory: '<rootDir>/coverage',
  projects: [
    {
      displayName: 'models',
      testEnvironment: 'node',
      testRegex: 'src/models/__tests__/.+model.test.js$',
      globalSetup: '<rootDir>/src/models/__tests__/_setup.js',
      // globalTeardown: '<rootDir>/src/models/__tests__/_teardown.js',
    },
    {
      displayName: 'controllers',
      testEnvironment: 'node',
      testRegex: 'src/models/__tests__/.+controller.test.js$',
      globalSetup: '<rootDir>/src/models/__tests__/_setup.js',
      // globalTeardown: '<rootDir>/src/models/__tests__/_teardown.js',
    },
    {
      displayName: 'api',
      testEnvironment: 'node',
      testRegex: 'src/models/__tests__/.+api.test.js$',
      globalSetup: '<rootDir>/src/models/__tests__/_setup.js',
      // globalTeardown: '<rootDir>/src/models/__tests__/_teardown.js',
    },
    {
      displayName: 'services',
      testEnvironment: 'node',
      testRegex: 'src/services/__tests__/.+service.test.js$',
      // globalSetup: '<rootDir>/src/models/__tests__/_setup.js',
      // globalTeardown: '<rootDir>/src/models/__tests__/_teardown.js',
    },
    {
      displayName: 'utils',
      testEnvironment: 'node',
      testRegex: 'src/utils/__tests__/.+test.js$',
      // globalSetup: '<rootDir>/src/models/__tests__/_setup.js',
      // globalTeardown: '<rootDir>/src/models/__tests__/_teardown.js',
    },
  ],
  maxWorkers: 1,
}
