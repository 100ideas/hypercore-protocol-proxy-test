const expressWebSocket = require('express-ws')
const websocketStream = require('websocket-stream/stream')
const ram = require('random-access-memory')
const pump = require('pump')

const EventEmitter = require('events');
class DatEmitter extends EventEmitter {}
const bus = new DatEmitter();

// const Dat = require('dat-node')
const Dat = require('@jimpick/dat-node')
const datOptions = {
  // latest: true, 
  live: true,
  // sparse: true,
  // key: '9e76c8624e47c892be7915a9a73830c64cdcf3f2732d91416961a1083683fe44',
  upload: false,
  stagingNewFormat: true
}

function initDat(dir, opts = datOptions) {
  Dat(dir, opts, function (err, dat) {
    console.log('replicating: dat://', dat.key.toString('hex'))
    console.log('Local key:', dat.archive.db.local.key.toString('hex'))

    if (err) {dat.close(); throw err}
    let progress = dat.importFiles({watch: true}) // with watch: true, there is no callback
    progress.on('put', function (src, dest) {
      console.log('importer:put ', src.name)
    })

    dat.archive.ready(() => {
      bus.emit('archive-ready', dat.archive)
    })
  
    // datStream = dat.archive.replicate({live: true, latest:true, encrypt: false})
    // datStream = dat.archive.replicate({encrypt: false, live: true})
  })
}

function authorizePeer (remoteKeyString, archive) {
  let remoteKey = Buffer.from(remoteKeyString, 'hex')
  archive.db.authorize(remoteKey, function (err) {
    if (err) console.log(err)
    archive.db.authorized(remoteKey, function (err, authorized) {
      if (err) console.log(err)
      if (!authorized) console.log('Authorization failed')
      console.log('Authorization succeeded.')
    })
  })
}

module.exports = gateway

let instanceCounter = 0
initDat('5-hyperdb-test')

function gateway (router) {
  return function attachWebsocket (server) {
    console.log('Attaching websocket')
    
    bus.on('archive-ready', (archive) => {

      expressWebSocket(router, server, {
        perMessageDeflate: false,
        handshakeTimeout: 8000
      })

      // maybe replace w/ autoauth?
      //   https://github.com/cblgh/hyperdb-examples/blob/master/index.js#L55
      //   https://github.com/karissa/hyperdiscovery/pull/12#pullrequestreview-95597621
      router.ws('/serverkey', (ws, req, next) => {
        // console.log("ws:/serverkey:", req.method, req.url);
        ws.on('message', function(msg) {
          console.log('ws:keysocket message received:', msg);
        });
        ws.send(archive.key.toString('hex'))
        ws.close()
        // console.log('socket', req.testing)
        // res.json({serverKey: archive.key.toString('hex')})
        // res.end()

        // next()
      });

      // router.ws('/proxy/:key', (ws, req) => {
      router.ws('/proxy/:key/:remoteKey', (ws, req) => {
        try {
          const instanceId = instanceCounter++
          const remoteDK = req.params.key
          const remoteLocalKey = req.params.remoteKey
          const serverDK = archive.key.toString('hex')
          const serverLocalKey = archive.db.local.key.toString('hex')

          console.log(`checking keys
          server dk: ${serverDK}
          remote dk: ${remoteDK}
          server lk: ${serverLocalKey}
          remote lk: ${remoteLocalKey}
          `)

          // if (remoteDK !== serverDK) {
          //   console.error("remoteDk !== serverDK")
          //   return
          // }

          authorizePeer(remoteLocalKey, archive)

          let datStream = archive.replicate({encrypt: false, live: true})

          console.log(`[${instanceId}] recreating ws replication pipe for ${serverDK}`)

          const wsStream = websocketStream(ws)
          pump(
            wsStream,
            datStream,
            wsStream,
            err => {
              console.log('pipe finished for', instanceId, serverDK, err && err.message)
              bus.emit('stream-error', err, archive)
              // datStream.end()
              // datStream = null // garbage collection?
              // datStream = initDat('dat-test-4')
            }
          )
        } catch (e) {
          console.error('Code error?', e)
        }
      })
    })
  }
}
