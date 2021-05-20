module.exports = {
  projects: [
    {
      displayName: 'models',
      testEnvironment: 'node',
      testRegex: 'src/models/__tests__/.+test.js$',

      globalSetup: '<rootDir>/src/models/__tests__/_setup.js',
      // setupFiles: ['<rootDir>/src/models/__tests__/_clearDb.js'],
    },
  ],
}
