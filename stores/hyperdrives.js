// const hyperdrive = require('hyperdrive')
const hyperdriveNext = require('@jimpick/hyperdrive-next')
const ram = require('random-access-memory')
const connectToGateway = require('../lib/websocketGateway')
const dumpWriters = require('../lib/dumpWriters')

require('events').prototype._maxListeners = 0

module.exports = store

function store (state, emitter) {
  state.list = []
  state.hello = ''
  state.status = ''
  state.archive = {}
  state.key = ''

  // const key = '72671c5004d3b956791b6ffca7f05025d62309feaf99cde04c6f434189694291'
  // const key = 'c9ad0cd90c94f2df867414823395901428d6b20fb67a2b4d3f74ea4b4f702d90'
  // const key = '8832871692ebd9cd8182a9fc3cc58937a4599811fbf25c71bb53a4dc51228334' // 5-hyperdb-test ?
  const key = '66cdb12b933842be01bfbbe3a6228e0dc0761ca9bf464f4d1c4105f3cfd7b504' // 5-hyperdb-test
  // const archive = hyperdrive(ram, key, {sparse: true, sparseMetadata: true, live: true})
  // const archive = hyperdrive(ram, key, {live: true})
  const archive = hyperdriveNext(ram, key, {live: true})
  // const archive = hyperdriveNext(ram, {live: true})
  const cancelConnection = connectToGateway(archive)
  // archive.ready(() => {
  //   archive.metadata.update(() => {
  //     console.log('Metadata Length:', archive.metadata.length)
  //     archive.readdir('/', (err, list) => {
  //       if (err) throw err
  //       state.list = list
  //       console.log("archive.metadata.update() ", list)
  //       emitter.emit('render')
  //       // cancelConnection()
  //     })
  //     archive.readFile('/hello-world.txt', (err, txt) => {
  //       if (err) throw err
  //       state.hello = txt + ''
  //       console.log(`hello-world.txt:\n${txt}`)
  //       emitter.emit('render')
  //       // cancelConnection()
  //     })
  //   })
  // })

  archive.ready(() => {
    console.log('hyperdrive ready')
    console.log('Local key:', archive.db.local.key.toString('hex'))
    state.archive = archive
    state.key = archive.key
    // if (state.cancelGatewayReplication) state.cancelGatewayReplication()
    // state.cancelGatewayReplication = connectToGateway(
    //   archive, updateSyncStatus, updateConnecting
    // )
    // readShoppingList()
    archive.db.watch(() => {
      console.log('Archive updated:', archive.key.toString('hex'))
      dumpWriters(archive)
      // readShoppingList()
      readDirHello(archive)

    })    
  })

  let readDirHello = (archive) => {
    archive.readdir('/', (err, list) => {
      if (err) throw err
      state.list = list
      console.log("...readdir", list)
      emitter.emit('render')
      toast("archive updated...")
    })
    archive.readFile('/hello-world.txt', (err, txt) => {
      if (err) throw err
      state.hello = (txt + '')
      toast('hello-world.txt updated')
      console.log(`...hello-world.txt:\n${txt}`)
      emitter.emit('render')
    })
  }

  let toast = (msg) => {
    state.status = msg ? msg : 'update...'
    setTimeout( () => {
      state.status = 'done'
      emitter.emit('render')
    }, 4000)
  }
}