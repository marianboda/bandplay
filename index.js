'use strict'
var request = require('request')
var progress = require('progress-stream')
var fs = require('fs')
var filesize = require('filesize')
var albumUrl = 'https://environments.bandcamp.com/album/fraktal'
var Bandcamp = require('./services/Bandcamp')
var Download = require('./services/Download')

request(albumUrl, (err, res, body) => {
  if (err) return null
  let album = Object.assign(Bandcamp.parseInfo(body), {data: Bandcamp.parseData(body)})
  console.log(album.data.artist + ' - ' + album.data.current.title)
  let dirName = `./${album.data.artist} - ${album.data.current.title}`
  for (let track of album.data.trackinfo) {
    console.log(track.track_num + '. ' + track.title + '    https:' + track.file['mp3-128'])
  }
  downloadTrack(album.data.trackinfo[0], dirName, (a,b) => console.log('done'))
})

var downloadTrack = function(track, dir, cb) {
  let trackUrl = 'https:' + track.file['mp3-128']
  let trackPath = `${dir}/${track.track_num}. ${track.title}.mp3`

  var progressHandler = (progress) => {
    process.stdout.clearLine()
    process.stdout.write('\rprogress: ' + Math.round(progress.percentage) + ' %')
  }
  Download(trackUrl, trackPath, cb, progressHandler)
}
