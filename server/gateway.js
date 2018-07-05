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

module.exports = gateway

function gateway (router) {
  return function attachWebsocket (server) {
    console.log('Attaching websocket')
    expressWebSocket(router, server, {
      perMessageDeflate: false
    })

    router.ws('/proxy/:key', (ws, req) => {
      const key = req.params.key
      const discoveryKey = crypto.discoveryKey(toBuffer(key))
      console.log('Websocket initiated for', key)
      const {stream: hpStream, proxy} = hyperproxy(key)

      const wsStream = websocketStream(ws)
      pump(
        wsStream,
        hpStream,
        wsStream,
        err => {
          console.log('pipe finished for ' + key, err && err.message)
        }
      )

      // Join swarm
      const sw = discoverySwarm(swarmDefaults({
        live: false,
        hash: false,
        stream: () => protocol({live: true}),
        connect: (connection, swarmStream) => {
          console.log('Jim swarm connect')
          proxy(swarmStream, {stream: connection})
        }
      }))

      sw.listen(0)
      sw.join(discoveryKey)

      sw.on('connection', function (peer, type) {
        // console.log('got', peer, type)
        console.log('new connection')
        console.log('connected to', sw.connections.length, 'peers')
        peer.on('close', function () {
          console.log('peer disconnected')
        })
      })
    })
  }
}
