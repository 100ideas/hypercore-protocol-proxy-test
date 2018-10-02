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
  console.dir(state)
  let list
  let footer
  if (state.list.length === 0) {
    list = html`<section id="main"><p>Loading...</p></section>`
  } else {
    list = html`
      <section id="main">
        <ul>
          ${state.list.map(item => html`<li>${item}</li>`)}
        </ul>
        <div>
          <h4>hello-world.txt:</h4> 
          <pre>${state.hello}</pre>
        </div>
      </section>
    `
  }
  footer = html`
    <section id="footer">
      <p>status: ${state.status}</p>
    </section>
  `
  return html`
    <body class=${prefix}>
      <h1>hypercore-protocol-proxy test</h1>
      ${list}
      ${footer}
    </body>
  `
}