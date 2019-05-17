# NOTE - see ipfs-service-worker-gateway
https://github.com/ipfs-shipyard/service-worker-gateway/blob/master/src/index.js

this code for IPFS was written by someone who knows how to set up service workers - review and profit

# duplex connect hyperdrive (hyperdb multiwriter) fs <-> browser

- https://gist.github.com/jimpick/2df9b96d1332e5e28bb626b8071e6677
- https://github.com/jimpick/dat-node/tree/multiwriter-staging


this repo is a half-assed hacky attempt to use service workers to transparently proxy resources referenced in the main browser dom via a dat archive (hyperdb). the idea was that static html, or at least client-side js app, could include hyperlinks to data sources that may resolve via a local static web file server, but if not, the service worker attempts to resolve them via dat distributed fs and overload the specific uris with it's fetch / cache system. In this way the source code of the static html file does not need to be modifid - in theory.

- working: duplex dat archive replication browser <--> local fs via indexdb; write in one place, see it in the other
- working: service-worker proxying of non-dat-archive image assets at certain local uris (`/collections/*`& `/imgproxy/*`).
- working: service worker dat archive replicated from browser indexdb. the sw archive can access copys of the files replicated from the main broweser window's dat archive
- not working: service worker proxying of image files from service-worker dat archive
  - not sure why these requests are 404ing working - maybe hairiness re: sw cache, or a race condition
  - or image data content encoding / headers are wrong

I don't know what I'm doing when it comes to service workers, low-level browser cache + req/res headers + content-encoding, and I found it hard to debug the sw (certain browsers don't make it easy to be sure the sw is updated), so overall the codebase is a big mess. 

if you are going to hack on it, `sw.js` is the service worker source that is the most up to date. It's ugly and is lacking automated build scripts to bundle deps into the it's src (no modules in sw :(.

overall I would say that this shows that service-worker proxying of dat resources is too finicky to use. Would be better to integrate dat in browser land (as it already is) with a state management library or at least a simple js script to find and transform certain uris in the main dom.

---

# hypercore-protocol-proxy-test

[https://hypercore-protocol-proxy-test.glitch.me/](https://hypercore-protocol-proxy-test.glitch.me/)

# Overview

Just seeing if [hypercore-protocol-proxy](https://github.com/mafintosh/hypercore-protocol-proxy) will work in a web page.

# License

MIT
