// Copyright 2021, Antonio Alvarado Hernández

const { createCB } = require('xmlbuilder2')
const { readProducts } = require('./reader.js')

const getItemValue = (item, context) => {
  if (!item.match(/\${.*}/)) return item
  return function (template) {
    return eval(template)
  }.call(Object.assign({}, context), `\`${item}\``)
}

const writeFeed = async (stream, feed) => {
  const builder = createCB({
    data: (chunk) => stream.write(chunk),
    end: () => stream.end(),
    prettyPrint: process.env.NODE_ENV === 'development',
  })

  const { parameters, rss, channel, items } = feed
  const { site, locale, encoding } = parameters
  // generate feed
  builder.dec({ encoding })
  builder.ele('rss')
  for (const att in rss)
    builder.att(att, rss[att])
  // generate channel
  builder.ele('channel')
  for (const elm in channel)
    builder.ele(elm).txt(channel[elm]).up()
  // generate items
  for await (const results of readProducts(site, locale)) {
    if (results._type !== 'product_result' || !results.data)
      continue
    for (const product of results.data) {
      builder.ele('item')
      for (const name in items) {
        const value = getItemValue(items[name], product)
        if (value)
          builder.ele(name).txt(value).up()
      }
      builder.up()
    }
  }
  // finish the feed up
  builder.end()
}

module.exports = { writeFeed }
