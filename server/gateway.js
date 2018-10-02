const expressWebSocket = require('express-ws')
const websocketStream = require('websocket-stream/stream')
const ram = require('random-access-memory')
const pump = require('pump')

// const Dat = require('dat-node')
const Dat = require('@jimpick/dat-node')
const datOptions = {
  latest: true, 
  live: true,
  sparse: true,
  upload: false,
  stagingNewFormat: true
}

// let datStream

let initDat = (dir) => {
  Dat(dir, datOptions, function (err, dat) {
    console.log('replicating: dat://', dat.key.toString('hex'))
    console.log('Local key:', dat.archive.db.local.key.toString('hex'))

    if (err) {dat.close(); throw err}
    let progress = dat.importFiles({watch: true}) // with watch: true, there is no callback
    progress.on('put', function (src, dest) {
      console.log('importer:put ', src.name)
    })
  
    return datStream = dat.archive.replicate({live: true, latest:true, encrypt: false})
  })
}

module.exports = gateway

let instanceCounter = 0

let datStream = initDat('5-hyperdb-test')

function gateway (router) {
  return function attachWebsocket (server) {
    console.log('Attaching websocket')
    expressWebSocket(router, server, {
      perMessageDeflate: false
    })

    router.ws('/proxy/:key', (ws, req) => {
      try {
        const instanceId = instanceCounter++
        const key = req.params.key
        console.log(`[${instanceId}] recreating ws replication pipe for ${key}`)

        const wsStream = websocketStream(ws)

        pump(
          wsStream,
          /*
          through2(function (chunk, enc, cb) {
            console.log('From websocket', chunk)
            this.push(chunk)
            cb()
          }),
          */
          // hpStream,
          datStream,
          /*
          through2(function (chunk, enc, cb) {
            console.log('To websocket', chunk)
            this.push(chunk)
            cb()
          }),
          */
          wsStream,
          err => {
            console.log('pipe finished for', instanceId, key, err && err.message)
            datStream.end()
            datStream = null // garbage collection?
            datStream = initDat('dat-test-4')
          }
        )
      } catch (e) {
        console.error('Code error?', e)
      }
    })
  }
}
