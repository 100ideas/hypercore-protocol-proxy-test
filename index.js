const choo = require('choo')
const css = require('sheetify')
const chooServiceWorker = require('choo-service-worker')
// var work = require('webworkify');

const hyperdrivesStore = require('./stores/hyperdrives')
const documentsStore = require('./stores/documents')

const mainView = require('./views/main')

css('dat-colors')
css('./index.css')

const app = choo()

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-service-worker/clear')())
  app.use(require('choo-devtools')())
}
// app.use(chooServiceWorker('/sw-unbundled.js'))
app.use(chooServiceWorker('/sw.js'))
// app.use(chooServiceWorker())

// app.use((state, emitter) => {
//   emitter.on('sw:installed', () => { console.log('sw:installed') })
//   emitter.on('sw:updated', () => { console.log('sw:updated') })
//   emitter.on('sw:redundant', () => { console.log('sw:redundant') })
//   if (navigator.serviceWorker) {
//     console.log('Service worker controller', navigator.serviceWorker.controller)
//     navigator.serviceWorker.getRegistrations()
//       .then(registrations => {
//         console.log('Service worker registrations', registrations)
//       })
//     navigator.serviceWorker.ready.then(serviceWorker => {
//       console.log('Service worker ready', serviceWorker)
//       state.serviceWorker = true
//     })
//     emitter.on('sw:message', (mesg) => console.dir(mesg))
//     emitter.emit('sw:postMessage', "test send message from browser")
//   }
// })

app.use((state) => {
  state.glitchAppName = 'hypercore-protocol-proxy-test'
  state.gitHubRepoName = 'jimpick/hypercore-protocol-proxy-test'
})

app.use(hyperdrivesStore)
app.use(documentsStore)

app.route('/', mainView)

app.use((state, emitter) => {
  navigator.serviceWorker.addEventListener('message', function(event) {
    // A message has been received
    var clientId = event.data.client
    console.log('Client ' + clientId + ' says: ' + event.data.message)
  })

  emitter.on('sw:postMessage', (message) => {
    // There isn’t always a service worker to send a message to. This can happen when the page is force reloaded.
    if (!navigator.serviceWorker.controller) {
        console.error('error: no controller')
      return
    }
    // Send the message to the service worker.
    navigator.serviceWorker.controller.postMessage(message.value)
  })
})

app.mount('body')
