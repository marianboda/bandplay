'use strict'

var cheerio = require("cheerio")

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

var parseData = function(body) {
  const $ = cheerio.load(body)
  return Object.values($('script')).reduce((acc, el) => ({
    ...acc,
    ...(el.attribs?.['data-vars'] ? { "vars": JSON.parse(el.attribs['data-vars']) } : {}),
    ...(el.attribs?.['data-tralbum'] ? { "data": JSON.parse(el.attribs['data-tralbum']) } : {}),
  }), {})
}

module.exports = {
  parseInfo: parseInfo,
  parseData: parseData,
}
