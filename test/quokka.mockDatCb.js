const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

function Dat(archive, opts) {
  if (!(this instanceof Dat)) return new Dat(archive, opts)
  assert.ok(archive, 'archive required')
  var self = this

  this.archive = archive
  this.options = opts
}

function create(cb, opts) {
  archive = "mock-hyperdb"
  opts = {live: true}
  console.log("mock archive.ready() delay")
  setTimeout( () => {
    cb(null, new Dat(archive, opts))
  }, 2000)
}

let arch = null
function waitForCb(cb) {
  create( function(err, dat) {
    console.log(dat.archive)
    arch = dat.archive
    myEmitter.emit('archive-ready', arch)
  })
}

waitForCb()

myEmitter.on('archive-ready', (a) => {
  console.log("arch is:", arch)
  console.log("archive is:", a)
});


