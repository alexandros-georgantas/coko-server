const Y = require('yjs')
const utils = require('./utils')

const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'

class WSSharedDoc extends Y.Doc {
  /**
   * @param {string} name
   */
  constructor(name) {
    super({ gc: gcEnabled })
    this.name = name
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<Object, Set<number>>}
     */
    this.conns = new Map()
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = new utils.awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)
    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = /** @type {Set<number>} */ (this.conns.get(
          conn,
        ))
        if (connControlledIDs !== undefined) {
          added.forEach(clientID => {
            connControlledIDs.add(clientID)
          })
          removed.forEach(clientID => {
            connControlledIDs.delete(clientID)
          })
        }
      }
      // broadcast awareness update
      const encoder = utils.encoding.createEncoder()
      utils.encoding.writeVarUint(encoder, utils.messageAwareness)
      utils.encoding.writeVarUint8Array(
        encoder,
        utils.awarenessProtocol.encodeAwarenessUpdate(
          this.awareness,
          changedClients,
        ),
      )
      const buff = utils.encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        utils.send(this, c, buff)
      })
    }
    this.awareness.on('update', awarenessChangeHandler)
    this.on('update', utils.updateHandler)
  }
}

module.exports = WSSharedDoc
