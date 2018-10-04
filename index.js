const choo = require('choo')
const css = require('sheetify')
const chooServiceWorker = require('choo-service-worker')

const hyperdrivesStore = require('./stores/hyperdrives')

const mainView = require('./views/main')

css('dat-colors')
css('./index.css')

const app = choo()

app.use(chooServiceWorker())
app.use((state, emitter) => {
  emitter.on('sw:installed', () => { console.log('sw:installed') })
  emitter.on('sw:updated', () => { console.log('sw:updated') })
  emitter.on('sw:redundant', () => { console.log('sw:redundant') })
  if (navigator.serviceWorker) {
    console.log('Service worker controller', navigator.serviceWorker.controller)
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        console.log('Service worker registrations', registrations)
      })
    navigator.serviceWorker.ready.then(serviceWorker => {
      console.log('Service worker ready', serviceWorker)
      state.serviceWorker = true
    })
  }
})

app.use(state => {
  state.glitchAppName = 'hypercore-protocol-proxy-test'
  state.gitHubRepoName = 'jimpick/hypercore-protocol-proxy-test'
})
app.use(hyperdrivesStore)

app.route('/', mainView)

app.mount('body')
