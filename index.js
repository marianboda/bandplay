'use strict'
var request = require('request')
var progress = require('progress-stream')
var fs = require('fs')
var filesize = require('filesize')
var Path = require('path')
var async = require('async')
var mkdirp = require('mkdirp')
var sanitizeFilename = require('sanitize-filename')
var Bandcamp = require('./services/Bandcamp')
var Download = require('./services/Download')
var Tag = require('./services/Tag')

var albumUrl  = process.argv[2]
if (!albumUrl) {
  console.log('No URL passed')
  process.exit(1)
}
var DOWNLOAD_ROOT = Path.join(process.env.HOME, 'Downloads', '_bandcamp')

var zeroPad = function(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

var downloadTrack = function(track, album, path, cb) {
  let trackUrl = 'https:' + track.file['mp3-128']
  let meta = {
    artist: album.data.artist,
    title: track.title,
    track: track.track_num,
    album: album.data.current.title,
    comment: album.data.url,
    year: new Date(album.data.album_release_date).getFullYear()
  }
  let coverPath = Path.join(Path.dirname(path), 'cover.jpg')
  if (coverPath) {
    meta.coverPath = coverPath
  }

  let progressHandler = (progress) => {
    // process.stdout.clearLine()
    // process.stdout.write('\rprogress: ' + Math.round(progress.percentage) + ' %')
  }
  Download(trackUrl, path, () => {
    Tag(path, meta, cb)
  }, progressHandler)
}

var getAlbum = function(url, cb) {
  request(albumUrl, (err, res, body) => {
    if (err) return null
    let album = Object.assign(Bandcamp.parseInfo(body), {data: Bandcamp.parseData(body)})
    let artist = album.data.artist
    let albumTitle = album.data.current.title
    let albumYear = new Date(album.data.album_release_date).getFullYear()

    let albumDir = `${artist} - [${albumYear}] ${albumTitle}`
    console.log(albumDir)
    let dirName = Path.join(DOWNLOAD_ROOT, albumDir)

    const coverUrl = album['og:image']

    Download(coverUrl, Path.join(dirName, 'cover.jpg'), (err) => {
      for (let track of album.data.trackinfo) {
        let filename = sanitizeFilename(`${zeroPad(track.track_num,2)} ${track.title}`)+'.mp3'
        console.log(track.track_num + '. ' + track.title)
        if (track.file)
          q.push({track: track, album: album, path: Path.join(dirName, filename), title: track.track_num + '. ' + track.title})
      }
      console.log('')
    })
  })
}

var q = async.queue((task, cb) => {
  console.log('DOWNLOADING', task.title)
  downloadTrack(task.track, task.album, task.path, (err) => {
    if (err) console.error(err)
    console.log(task.track.track_num + ' done')
    cb()
  })
}, 4)

mkdirp(DOWNLOAD_ROOT, (err) => {
  getAlbum(albumUrl)
})
