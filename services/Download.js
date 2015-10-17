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
    var prog = progress({time:1000}, progressHandler)
    var r = request(url, (err, res) => {
      console.log(res.status + '\n');
    })
    r.on('response', (res) => {
      size = res.headers['content-length']
      console.log('SIZE: ', filesize(size))
      prog.setLength(size)
    })
    r.pipe(prog)
      .pipe(stream)
      .on('finish', cb)
  })
}

module.exports = download
