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

const imgExts = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff']);

let makeImgTag = (imgSrc) => {
  let ext = imgSrc.substring(imgSrc.lastIndexOf('.') + 1).toLowerCase() || ''
  return imgExts.has(ext) ? html`<p><img src=/${imgSrc} /></p>` : ''
}

function mainView (state, emit) {
  // console.dir(state)
  let list
  let footer
  // let read_hwtxt = state.archive.readFile('/hello-world.txt', (err, txt) => txt)()
  
  let deleteLineButton = () => {
    emit('deleteHelloWorldLine')
  }

  if (state.list.length === 0) {
    list = html`<section id="main"><p>Loading...</p><small>(try reloading page if blank)</small></section>`
  } else {
    window.archive = state.archive ? state.archive : null
    list = html`
      <section id="main">
        <div>
          <h4>contents of .dat archive (try reloading page if blank)</h4> 
          <pre>archive ready? ${JSON.stringify(state.archiveReady)}</pre>
        </div>
        <ul>
          ${state.list.map(item => html`<li><a href="/${item}">${item}</a> ${makeImgTag(item)} </li>`)}
        </ul>
        <div>
          <h4>hello-world.txt:</h4> 
          <pre>${state.hello}</pre>
          <button onclick=${deleteLineButton}>delete last line</button>
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
      <img src="imgproxy/smallimage.png">
      <img src="collections/scienceimage.png">
      
      ${list}  
      
      ${footer}
    </body>
  `
}

module.exports = mainView