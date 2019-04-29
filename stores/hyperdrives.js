// const hyperdrive = require('hyperdrive')
const rai = require('random-access-idb')
const hyperdriveNext = require('@jimpick/hyperdrive-next')
const ram = require('random-access-memory')
const crypto = require('hypercore/lib/crypto')
const connectToGateway = require('../lib/websocketGateway')
const dumpWriters = require('../lib/dumpWriters')

require('events').prototype._maxListeners = 0

module.exports = store

const host = document.location.host
const proto = document.location.protocol === 'https:' ? 'wss' : 'ws'
const url = `${proto}://${host}/serverkey`
console.log('connectToGateway checking /serverkey')

function store (state, emitter) {
  state.list = []
  state.hello = ''
  state.status = ''
  state.archive = {}
  state.key = ''
  state.archiveReady = false

  const keysocket = new WebSocket(url)
  // Connection opened
  keysocket.addEventListener('open', function (event) {
    console.log("keysocket connected")
    keysocket.send('Hello Server!')
  });
  // Listen for messages
  keysocket.addEventListener('message', function (event) {
    // return {serverDK, name} message; parse; add to state.documents[]
    console.log('Message from server ', event)
    state.serverDK = event.data
    state.archiveName = "unnamed"
    state.shortKey = state.serverDK.slice(0, 8)
    initArchive()
  });

  function initArchive(){
    
    const storage = rai(`doc-${state.serverDK}`)
    const archive = hyperdriveNext(storage, state.serverDK)
    archive.ready(() => {
      console.log('hyperdrive ready')
      console.log('Local key:', archive.db.local.key.toString('hex'))
      state.key = archive.key.toString('hex')
      state.archive = archive
      state.archiveReady = true
      emitter.emit('render')

      emitter.emit('writeNewDocumentRecord', state.key, state.archiveName)
      
      if (state.cancelGatewayReplication) state.cancelGatewayReplication()
      state.cancelGatewayReplication = connectToGateway(archive)
      
      let firstWrite = true;

      archive.db.watch(() => {
        console.log('Archive updated:', archive.key.toString('hex'))
        dumpWriters(archive)
        // readShoppingList()
        readDirHello(archive)

        if (firstWrite) { 
          firstWrite = false
          setTimeout( () => {
            appendHello(archive, "hello from browser write")
          }, 4000)
        }

      })
    })
  }

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

  let appendHello = (archive, msg = "") => {
    archive.readFile('/hello-world.txt', (err, txt) => {
      if (err) throw err
      msg = txt + '\n' + msg
      toast('writing to hello-world.txt')
      console.log(`writing to hello-world.txt:\n${msg}`)
      
      archive.writeFile('/hello-world.txt', msg, (err) => {
        if (err) throw err
        console.log("write ok")
      })
      // emitter.emit('render')
    })
  }

  let replaceLastLineHello = (archive, msg = "") => {
    archive.readFile('/hello-world.txt', (err, txt) => {
      if (err) throw err
      txt = ('' + txt).split('\n').slice(0, -1)      
      txt = txt.join('\n') + msg
      
      toast(`replacing last line of hello-world.txt with: ${msg}`)
      console.log(`replacing last line of hello-world.txt with:\n${msg}`)
      
      archive.writeFile('/hello-world.txt', txt, (err) => {
        if (err) throw err
        console.log("write ok")
      })
      // emitter.emit('render')
    })
  }

  emitter.on('deleteHelloWorldLine', () => replaceLastLineHello(state.archive) )

  let toast = (msg) => {
    state.status = msg ? msg : 'update...'
    setTimeout( () => {
      state.status = 'done'
      emitter.emit('render')
    }, 4000)
  }
  
}