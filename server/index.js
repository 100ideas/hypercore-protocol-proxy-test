#!/usr/bin/env node

const fs = require('fs')
const rimraf = require('rimraf');
const path = require('path')
const budo = require('budo')
const express = require('express')
const compression = require('compression')
const mkdirp = require('mkdirp')
const gateway = require('./gateway')
const redirectToHttps = require('./middleware/redirectToHttps')

require('events').prototype._maxListeners = 0

process.chdir(path.resolve(__dirname, '..'))

const datdir = '5-hyperdb-test/.dat/'
fs.access(datdir, fs.constants.F_OK | fs.constants.W_OK, (err) => {
  if (err) {
    console.error(
      `${datdir} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
  } else {
    console.log(`${datdir} exists, and it is writable. Deleting .dat...`);
    rimraf.sync(datdir, {}, (err) => console.log(err))
  }
});


const router = express.Router()

function serveIndex (req, res, next) {
  // req.url = '/'
  console.log('serveindex', req.method, req.url)
  next()
}

router.get('/', serveIndex)
router.get('/index.html', serveIndex)
// router.get('/serverkey', (req, res) => res.send('you got the key'))

const attachWebsocket = gateway(router)

function runBudo () {
  const port = process.env.PORT || 5000
  const devServer = budo('index.js', {
    port,
    browserify: {
      transform: [
        'brfs',
        ['sheetify', {transform: ['sheetify-nested']}]
      ]
    },
    middleware: [
      compression(),
      redirectToHttps,
      express.static('img'),
      router
    ],
    dir: ['.', 'static'],
    staticOptions: {
      cacheControl: true,
      maxAge: 60 * 60 * 1000 // one hour
    }
    /*
    stream: process.stdout,
    verbose: true
    */
  })
  devServer.on('connect', event => {
    console.log('Listening on', event.uri)
    attachWebsocket(event.server)
  })
}

runBudo()
