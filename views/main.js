const html = require('choo/html')
const css = require('sheetify')
const prettyHash = require('pretty-hash')

const prefix = css`
  :host {
    .content {
      margin: 1rem 1rem 2rem 1rem;
    }
  }
`

module.exports = mainView

function mainView (state, emit) {
  return html`
    <body class=${prefix}>
      <h1>hypercore-protocol-proxy test</h1>
      Test.
    </body>
  `
}
