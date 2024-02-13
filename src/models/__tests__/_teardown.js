const db = require('../../dbManager/db')

module.exports = async () => {
  db.destroy()
}
