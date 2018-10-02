const hyperdrive = require('hyperdrive')
const ram = require('random-access-memory')
const connectToGateway = require('../lib/websocketGateway')

require('events').prototype._maxListeners = 0

module.exports = store

function store (state, emitter) {
  state.list = []
  state.hello = ''
  state.status = ''

  // const key = '72671c5004d3b956791b6ffca7f05025d62309feaf99cde04c6f434189694291'
  const key = 'c9ad0cd90c94f2df867414823395901428d6b20fb67a2b4d3f74ea4b4f702d90'
  // const archive = hyperdrive(ram, key, {sparse: true, sparseMetadata: true, live: true})
  const archive = hyperdrive(ram, key, {live: true})
  const cancelConnection = connectToGateway(archive)
  archive.ready(() => {
    archive.metadata.update(() => {
      console.log('Metadata Length:', archive.metadata.length)
      // archive.readdir('/', (err, list) => {
      //   if (err) throw err
      //   state.list = list
      //   console.log("archive.metadata.update() ", list)
      //   emitter.emit('render')
      //   // cancelConnection()
      // })
      // archive.readFile('/hello-world.txt', (err, txt) => {
      //   if (err) throw err
      //   state.hello = txt + ''
      //   console.log(`hello-world.txt:\n${txt}`)
      //   emitter.emit('render')
      //   // cancelConnection()
      // })
    })
  })
  archive.on('update', (x) => {
    console.log("archive.on('update')...")
    archive.readdir('/', (err, list) => {
      if (err) throw err
      state.list = list
      console.log("...readdir", list)
      emitter.emit('render')
      toast("archive updated...")
      // cancelConnection()
    })
    archive.readFile('/hello-world.txt', (err, txt) => {
      if (err) throw err
      state.hello = (txt + '')
      toast('hello-world.txt updated')
      console.log(`...hello-world.txt:\n${txt}`)
      emitter.emit('render')
      // cancelConnection()
    })

  })

  let toast = (msg) =>
    state.status = msg ? msg : 'update...'
      setTimeout( () => {
        state.status = 'done'
        emitter.emit('render')
      }, 4000)
}