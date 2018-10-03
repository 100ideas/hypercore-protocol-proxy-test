// const expressWebSocket = require('express-ws')
// const websocketStream = require('websocket-stream/stream')
// const ram = require('random-access-memory')
// const pump = require('pump')

// // const Dat = require('dat-node')
// const Dat = require('@jimpick/dat-node')
// const datOptions = {
//   // latest: true, 
//   live: true,
//   // sparse: true,
//   upload: false,
//   stagingNewFormat: true
// }

// let localDat

// function initDat(dir, opts) {
//   Dat(dir, opts, function (err, dat) {
//     console.log('replicating: dat://', dat.key.toString('hex'))
//     console.log('Local key:', dat.archive.db.local.key.toString('hex'))

//     if (err) {dat.close(); throw err}
//     let progress = dat.importFiles({watch: true}) // with watch: true, there is no callback
//     progress.on('put', function (src, dest) {
//       console.log('importer:put ', src.name)
//     })
  
//     // datStream = dat.archive.replicate({live: true, latest:true, encrypt: false})
//     datStream = dat.archive.replicate({encrypt: false, live: true})
//   })
// }

// module.exports = gateway

// let instanceCounter = 0

// // let datStream = initDat('5-hyperdb-test')
// // initDat('5-hyperdb-test')

// function gateway (router) {
//   return function attachWebsocket (server) {
//     console.log('Attaching websocket')
//     expressWebSocket(router, server, {
//       perMessageDeflate: false,
//       handshakeTimeout: 8000
//     })

//     router.ws('/proxy/:key', (ws, req) => {
//       try {
//         const instanceId = instanceCounter++
//         const key = req.params.key

//         datOptions.key = key
//         initDat('5-hyperdb-test', datOptions)

//         console.log(`[${instanceId}] recreating ws replication pipe for ${key}`)

//         const wsStream = websocketStream(ws)

//         // wait for dat to initialize
//         setTimeout( () => {
//           console.log("timout")
//           pump(
//             wsStream,
//             datStream,
//             wsStream,
//             err => {
//               console.log('pipe finished for', instanceId, key, err && err.message)
//               // datStream.end()
//               // datStream = null // garbage collection?
//               // datStream = initDat('dat-test-4')
//             }
//           )
//         }, 4000)
//         // pump(
//         //   wsStream,
//         //   datStream,
//         //   wsStream,
//         //   err => {
//         //     console.log('pipe finished for', instanceId, key, err && err.message)
//         //     // datStream.end()
//         //     // datStream = null // garbage collection?
//         //     // datStream = initDat('dat-test-4')
//         //   }
//         // )
//       } catch (e) {
//         console.error('Code error?', e)
//       }
//     })
//   }
// }
