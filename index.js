const choo = require('choo')
const css = require('sheetify')

const hyperdrivesStore = require('./stores/hyperdrives')

const mainView = require('./views/main')

css('dat-colors')
css('./index.css')

const app = choo()

app.use(state => {
  state.glitchAppName = 'hypercore-protocol-proxy-test'
  state.gitHubRepoName = 'jimpick/hypercore-protocol-proxy-test'
})
app.use(hyperdrivesStore)

app.route('/', mainView)

app.mount('body')
