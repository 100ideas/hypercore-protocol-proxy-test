const expressWebSocket = require('express-ws')
const websocketStream = require('websocket-stream/stream')
const ram = require('random-access-memory')
const crypto = require('hypercore-crypto')
const pump = require('pump')
const toBuffer = require('to-buffer')
const hyperproxy = require('hypercore-protocol-proxy')
const swarmDefaults = require('dat-swarm-defaults')
const discoverySwarm = require('discovery-swarm')
const protocol = require('hypercore-protocol')
const through2 = require('through2')

const Dat = require('dat-node')
const datOptions = {
  latest: true, 
  live: true,
  sparse: true,
  upload: false
}

let datStream
Dat('dat-test-4', datOptions, function (err, dat) {
  console.log('replicating: dat://', dat.key.toString('hex'))

  if (err) throw err
  let progress = dat.importFiles({watch: true}) // with watch: true, there is no callback
  progress.on('put', function (src, dest) {
    console.log('importer:put ', src.name)
  })

  datStream = dat.archive.replicate({live: true, latest:true, encrypt: false})
})

module.exports = gateway

let instanceCounter = 0

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
        console.log('New gateway instance', instanceId, key)
        // const discoveryKey = crypto.discoveryKey(toBuffer(key, 'hex'))
        // const hpStream = protocol({encrypt: false})
        // hpStream.label = 'hpStream'
        // hpStream.on('error', err => {
        //   console.error('Proxy stream error', instanceId, err)
        // })
        // const {proxy} = hyperproxy(toBuffer(key, 'hex'), {stream: hpStream})
      
          
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
            // sw.close()
          }
        )
      } catch (e) {
        console.error('Code error?', e)
      }
    })
  }
}
