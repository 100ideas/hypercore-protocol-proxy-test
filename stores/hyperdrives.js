const hyperdrive = require('hyperdrive')
const ram = require('random-access-memory')
const connectToGateway = require('../lib/websocketGateway')

require('events').prototype._maxListeners = 0

module.exports = store

function store (state, emitter) {
  state.list = []

  const key = '72671c5004d3b956791b6ffca7f05025d62309feaf99cde04c6f434189694291'
  const archive = hyperdrive(ram, key, {sparse: true, sparseMetadata: true})
  connectToGateway(archive)
  archive.ready(() => {
    archive.metadata.update(() => {
      console.log('Length', archive.metadata.length)
      archive.readdir('/media/content', (err, list) => {
        if (err) throw err
        state.list = list
        emitter.emit('render')
      })
    })
  })
}
