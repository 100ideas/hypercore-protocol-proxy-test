const smallImage = 'data:image/png;base64,diVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAMAAAAbzM5ZAAAACVBMVEWs3t4AVFpMkZTmA5phAAAAUElEQVQokWNgxAIYGBkwAPUEGRkxBcG2oglC3YIiCHchkiCSu+GCKL4hYOYAC+IIJTRBsE4mIAKxmB+hyIkmpAgDu0MyIIQi8hxJxZBLAAAEuQA45SJc9sAAAAASUVORK5CYII=';

self.addEventListener('fetch', function(event) {
  console.log("sw checking req for", event.request.url)

  if(event.request.url.indexOf("collections") !== -1) {
    console.log("sw creating response for", event.request.url)
    event.respondWith( new Promise( resolve => {
      fetch('img/xkcd.jpg')
      .then( res => {
        res.blob().then( resblob => {
          console.log("sw intercepting req for", event.request.url)

          let init = { status: 200, statusText: "ok", headers: { "content-type": "image/png" }}
          // TODO await get image from dat indexdb
          let body = smallImage

          // body should be Blob, BUfferSource, ReadableStream, or USVString
          // let response = new Response(body, init)
          let response = new Response(resblob)
          resolve(response)
        })
      }).catch(function(err) {
        console.error("ws fetch err:", err)
      })
    }))
  };
});

/** 
=============== works =====================

self.addEventListener('fetch', function(event) {
  console.log("sw checking req for", event.request.url)

  if(event.request.url.indexOf("collections") !== -1) {
    console.log("sw creating response for", event.request.url)
    // event.respondWith(async function() {
    event.respondWith( new Promise( resolve => {
      fetch('img/xkcd.jpg').then(function(res) {
        console.log("sw intercepting req for", event.request.url)
        console.log("fetched", res.url)
        console.dir(res)
        // return res
        resolve(res)
      })
    }).catch(function(err) {
      console.error("ws fetch err:", err)
    }))
  };
});

**/