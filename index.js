'use strict'
var request = require('request')
var progress = require('progress-stream')
var fs = require('fs')
var filesize = require('filesize')
var albumUrl = 'https://environments.bandcamp.com/album/fraktal'

var parseInfo = function (body) {
  let regex = /<meta\b[^>]*>/gi
  let matches = body.match(regex)
  // matches.splice(5)
  let mets = matches.map( (item) => {
    let regex2 = /([a-z]+)="([^"]*)"/gi
    let meta = {}
    let match
    while ((match = regex2.exec(item))) {
      meta[match[1]] = match[2]
    }
    return meta
  })

  let info = mets.reduce((prev, curr) => {
    let c = {}
    let key = (curr.name) ? curr.name : curr.property
    if (!key) return prev
    c[key] = curr.content
    return Object.assign(c, prev)
  }, {})
  return info
}

var parseData = function(body) {
  let regex = /var TralbumData = ({(.|\s)*?)};/gmi
  let match = regex.exec(body)
  let res = match[0].replace(/\/\/ .*\n/g, '').replace('var TralbumData = ', '')
  .replace(/\s+([a-z_A-Z]+)\s?:/g, '"$1":').replace('" + "', '').replace(/;$/, '')
  // console.log(JSON.parse(res))
  return JSON.parse(res)
}

request(albumUrl, (err, res, body) => {
  if (err) return null
  let album = Object.assign(parseInfo(body), {data: parseData(body)})
  // console.log({data: parseData(body)})
  console.log(album.data.artist + ' - ' + album.data.current.title)
  for (let track of album.data.trackinfo) {
    // console.log(track)
    console.log(track.track_num + '. ' + track.title + '    https:' + track.file['mp3-128'])
  }
})

// var url = 'https://popplers5.bandcamp.com/download/track?enc=mp3-128&fsig=211695e6273f979a0fe77b9454d2afa7&id=1367527005&stream=1&ts=1444928785.0'
// var stream = fs.createWriteStream('./o.mp3')

// var size = 0
// var progressHandler = (progress) => {
//   process.stdout.clearLine()
//   process.stdout.write('\rprogress: ' + Math.round(progress.transferred / size * 100) + ' %')
// }
// var prog = progress({time:1000}, progressHandler)
// var r = request(url, (err, res) => {
//   console.log(res.status + '\n');
// })
// r.on('response', (res) => {
//   size = res.headers['content-length']
//   console.log('SIZE: ', filesize(size))
// })
// r.pipe(prog).pipe(stream)
//   .on('finish', (a) => console.log('all done'))
//
