'use strict'

var id3 = require('id3-writer')
var writer = new id3.Writer()

var write = function(path, data, cb) {
  let cover = null
  if (data.coverPath) {
    cover = new id3.Image(data.coverPath)
    delete data.coverPath
  }
  let mp3 = new id3.File(path)
  let meta = (cover != null) ? new id3.Meta(data, [cover]) : new id3.Meta(data)
  writer.setFile(mp3).write(meta, cb)
}

module.exports = write
