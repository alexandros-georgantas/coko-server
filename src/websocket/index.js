// const { createServer } = require('http')
const { WebSocketServer } = require('ws')
const webSocket = require('ws')
const Y = require('yjs')
const map = require('lib0/dist/map.cjs')
const WSSharedDoc = require('./webshared')
const startServer = require('../startServer')
const utils = require('./utils')

const docs = new Map()
const persistence = null

const init = async () => {
  const server = await startServer()
  // console.log('eaaa', server)
  const wss = new WebSocketServer({ server })

  wss.on('connection', function connection(ws, request) {
    const docName = request.url.slice(1).split('?')[0]
    const gc = true
    const doc = getYDoc(docName, gc)
    doc.conns.set(ws, new Set())
    ws.on('message', message =>
      messageListener(ws, doc, new Uint8Array(message)),
    )
  })

  const getYDoc = (docName, gc = true) =>
    map.setIfUndefined(docs, docName, () => {
      const doc = new WSSharedDoc(docName)
      doc.gc = gc
      if (persistence !== null) {
        persistence.bindState(docName, doc)
      }
      docs.set(docName, doc)
      return doc
    })

  /**
   * @param {any} conn
   * @param {WSSharedDoc} doc
   * @param {Uint8Array} message
   */
  const messageListener = (conn, doc, message) => {
    try {
      const encoder = utils.encoding.createEncoder()
      const decoder = utils.decoding.createDecoder(message)
      const messageType = utils.decoding.readVarUint(decoder)
      console.log(messageType)
      // eslint-disable-next-line default-case
      switch (messageType) {
        case utils.messageSync:
          utils.encoding.writeVarUint(encoder, utils.messageSync)
          utils.syncProtocol.readSyncMessage(decoder, encoder, doc, null)

          if (utils.encoding.length(encoder) > 1) {
            utils.send(doc, conn, utils.encoding.toUint8Array(encoder))
          }
          break
        case utils.messageAwareness: {
          utils.awarenessProtocol.applyAwarenessUpdate(
            doc.awareness,
            utils.decoding.readVarUint8Array(decoder),
            conn,
          )
          break
        }
      }
    } catch (err) {
      console.error(err)
      doc.emit('error', [err])
    }
  }
}

init()
