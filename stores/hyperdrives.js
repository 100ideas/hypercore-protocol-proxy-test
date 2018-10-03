// const hyperdrive = require('hyperdrive')
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

  const keysocket = new WebSocket(url)
  // Connection opened
  keysocket.addEventListener('open', function (event) {
    console.log("keysocket connected")
    keysocket.send('Hello Server!');
  });
  // Listen for messages
  keysocket.addEventListener('message', function (event) {
    console.log('Message from server ', event);
    state.serverDK = event.data;
    initArchive()
  });

  // const archive = hyperdriveNext(ram, {live: true})
  // const archive = hyperdriveNext(ram, {encrypt:false, live: true})
  
  // const {publicKey: key, secretKey} = crypto.keyPair()
  // const remotekey = '65acfa8c688d72eb37c036960ec135c64e0421634a3086f687f7b4a4bfe77122' // 5-hyperdb-test
  // const archive = hyperdriveNext(ram, key, {secretKey}
  // const archive = hyperdriveNext(ram, remotekey)
  function initArchive(){
    // let secretKey = Buffer.from('65acfa8c688d72eb37c036960ec135c64e0421634a3086f687f7b4a4bfe77122', 'hex')
    // const archive = hyperdriveNext(ram, state.serverDK, {secretKey})
    const archive = hyperdriveNext(ram, state.serverDK)
    archive.ready(() => {
      console.log('hyperdrive ready')
      console.log('Local key:', archive.db.local.key.toString('hex'))
      state.key = archive.key
      state.archive = archive
      emitter.emit('render')
      
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
            writeHello(archive, "hello from browser write")
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

  let writeHello = (archive, msg = "") => {
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

  let toast = (msg) => {
    state.status = msg ? msg : 'update...'
    setTimeout( () => {
      state.status = 'done'
      emitter.emit('render')
    }, 4000)
  }
}