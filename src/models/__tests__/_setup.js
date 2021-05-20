const { migrate } = require('@pubsweet/db-manager')

module.exports = async () => {
  await migrate()
}
