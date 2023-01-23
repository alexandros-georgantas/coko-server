const { eslint } = require('@coko/lint')

eslint.rules['import/no-extraneous-dependencies'][1].devDependencies.push(
  '**/__tests__/**/*.js',
)

eslint.rules['react/forbid-prop-types'] = 0

module.exports = eslint
