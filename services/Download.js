'use strict'
var request = require('request')
var progress = require('progress-stream')
var fs = require('fs')
var filesize = require('filesize')
var mkdirp = require('mkdirp')
var Path = require('path')

var download= function(url, path, cb, progressHandler) {

  mkdirp(Path.dirname(path), (err) => {
    let size = 0
    var stream = fs.createWriteStream(path)
    if (!progressHandler) progressHandler = () => {}
    var prog = progress({time:1000}, progressHandler)
    var r = request(url, (err, res) => {
      if (err) return cb(err)
    })
    r.on('response', (res) => {
      size = res.headers['content-length']
      prog.setLength(size)
    })
    r.pipe(prog)
      .pipe(stream)
      .on('finish', cb)
  })
}

module.exports = download
