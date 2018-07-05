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
  let list
  if (state.list.length === 0) {
    list = html`<p>Loading...</p>`
  } else {
    list = html`
      <ul>
        ${state.list.map(item => html`<li>${item}</li>`)}
      </ul>
    `
  }
  return html`
    <body class=${prefix}>
      <h1>hypercore-protocol-proxy test</h1>
      ${list}
    </body>
  `
}
