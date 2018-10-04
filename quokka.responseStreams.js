
// https://github.com/substack/stream-handbook
// https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js#22085851

const smallImage = 'data:image/png;base64,diVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAMAAAAbzM5ZAAAACVBMVEWs3t4AVFpMkZTmA5phAAAAUElEQVQokWNgxAIYGBkwAPUEGRkxBcG2oglC3YIiCHchkiCSu+GCKL4hYOYAC+IIJTRBsE4mIAKxmB+hyIkmpAgDu0MyIIQi8hxJxZBLAAAEuQA45SJc9sAAAAASUVORK5CYII=';

var Readable = require('stream').Readable;
var rs = Readable();

var c = 97;
rs._read = function () {
    rs.push(String.fromCharCode(c++));
    if (c > 'z'.charCodeAt(0)) rs.push(null);
};

let res = ''
rs.on('data', (x) => {
  res = res + x
})
rs.on('end', () => console.log(res))


// rs.pipe(process.stdout);



// thanks!
//   https://gist.github.com/borismus/1032746
var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}


