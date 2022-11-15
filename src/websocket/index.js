const { WebSocketServer } = require('ws')
const Y = require('yjs')
const map = require('lib0/dist/map.cjs')
const levelDb = require('y-leveldb')
const WSSharedDoc = require('./webshared')
const startServer = require('../startServer')
const utils = require('./utils')

const docs = new Map()
const pingTimeout = 30000
const persistenceDir = process.env.YPERSISTENCE || './dbDir'
let persistence = null

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

    let pingReceived = true
    const pingInterval = setInterval(() => {
      if (!pingReceived) {
        if (doc.conns.has(ws)) {
          utils.closeConn(doc, ws)
        }
        clearInterval(pingInterval)
      } else if (doc.conns.has(ws)) {
        pingReceived = false
        try {
          ws.ping()
        } catch (e) {
          utils.closeConn(doc, ws)
          clearInterval(pingInterval)
        }
      }
    }, pingTimeout)
    ws.on('close', () => {
      utils.closeConn(doc, ws)
      clearInterval(pingInterval)
    })
    ws.on('ping', () => {
      pingReceived = true
    })
    {
      const encoder = utils.encoding.createEncoder()
      utils.encoding.writeVarUint(encoder, utils.messageSync)
      utils.syncProtocol.writeSyncStep1(encoder, doc)
      utils.send(doc, ws, utils.encoding.toUint8Array(encoder))
      const awarenessStates = doc.awareness.getStates()
      if (awarenessStates.size > 0) {
        utils.encoding.writeVarUint(encoder, utils.messageAwareness)
        utils.encoding.writeVarUint8Array(
          encoder,
          utils.awarenessProtocol.encodeAwarenessUpdate(
            doc.awareness,
            Array.from(awarenessStates.keys()),
          ),
        )
        utils.send(doc, ws, utils.encoding.toUint8Array(encoder))
      }
    }
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

  if (typeof persistenceDir === 'string') {
    console.log(`Persisting documents to "${persistenceDir}"`)
    const LevelDbPersistence = levelDb.LeveldbPersistence
    const ldb = new LevelDbPersistence(persistenceDir)
    persistence = {
      provider: ldb,
      bindState: async (docName, ydoc) => {
        const persistedYdoc = await ldb.getYDoc(docName)
        const newUpdates = Y.encodeStateAsUpdate(ydoc)
        ldb.storeUpdate(docName, newUpdates)
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
        ydoc.on('update', update => {
          ldb.storeUpdate(docName, update)
        })
      },
      writeState: async (docName, ydoc) => {},
    }
  }
}

init()
