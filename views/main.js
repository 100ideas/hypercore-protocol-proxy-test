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
  // console.dir(state)
  let list
  let footer
  if (state.list.length === 0) {
    
    if (state.archive){
      window.archive = state.archive
      window.archiveAuth = (remoteKeyString) => {
        let remoteKey = Buffer.from(remoteKeyString, 'hex')
        state.archive.db.authorize(remoteKey, function (err) {
          if (err) console.log(err)
          state.archive.db.authorized(remoteKey, function (err, authorized) {
            if (err) console.log(err)
            if (!authorized) console.log('Authorization failed')
            console.log('Authorization succeeded.')
          })
        })
      }
    }

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