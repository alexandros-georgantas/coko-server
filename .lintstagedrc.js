const without = require('lodash/without')

const { lintstaged } = require('@coko/lint')

lintstaged['*.js'] = without(lintstaged['*.js'], 'stylelint')

module.exports = lintstaged
