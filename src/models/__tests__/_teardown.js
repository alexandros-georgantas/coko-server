const { db } = require('@pubsweet/db-manager')

module.exports = () => {
  db.destroy()
}
