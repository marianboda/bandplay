'use strict'

var parseInfo = function (body) {
  let regex = /<meta\b[^>]*>/gi
  let matches = body.match(regex)
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

var parseJSObject = function(body, name) {
  let regex = new RegExp('var ' + name + ' = ({(.|\\s)*?)};','gmi')
  console.log(regex)
  let match = regex.exec(body)
  let res = match[0].replace(/\/\/ .*\n/g, '').replace('var ' + name + ' = ', '')
  .replace(/\s+([a-z_A-Z]+)\s?:/g, '"$1":').replace('" + "', '').replace(/;$/, '')
  return JSON.parse(res)
}

var parseData = function(body) {
  return parseJSObject(body, 'TralbumData')
}

module.exports = {
  parseInfo: parseInfo,
  parseData: parseData,
}
