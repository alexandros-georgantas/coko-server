const config = require('config')
const Authsome = require('authsome')

/* eslint-disable-next-line import/no-dynamic-require */
const mode = require(config.get('authsome.mode'))

const models = require('@pubsweet/models')

// be lenient with custom/extended data models based on BaseModel
// and allow them through to authsome in their entirety. If you use this
// you are responsible for providing a similar interface in the client
// as well - if you want your authsome modes to be usable on both platforms.
const context = { models: { ...models } }

const authsome = new Authsome({ ...config.authsome, mode }, context)

module.exports = authsome
