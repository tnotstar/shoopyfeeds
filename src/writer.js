// Copyright 2021, Antonio Alvarado Hernández

const { createCB } = require('xmlbuilder2')
const { readProducts } = require('./reader.js')


const writeFeed = async (stream, site, locale, headers) => {
  const builder = createCB({
    data: (chunk) => stream.write(chunk),
    end: () => stream.end(),
    prettyPrint: false //process.env.NODE_ENV === 'development',
  })

  // generate channel headers
  const ns = 'http://base.google.com/ns/1.0'
  builder.dec({ encoding: 'UTF-8' })
    .ele('rss').att('xmlns:g', ns).att('version', '2.0')
    .ele('channel')
  if (headers.title)
    builder.ele('title').txt(headers.title).up()
  if (headers.link)
    builder.ele('link').txt(headers.link).up()
  if (headers.description)
    builder.ele('description').txt(headers.description).up()

  // generate items info
	for await (let results of readProducts(site, locale)) {
		if (results._type !== 'product_result')
			continue
		for (let product of results.data) {
			builder.ele('item')
				.ele('g:id').txt(product.id).up()
				.ele('title').txt(product.page_title || product.name).up()
      if (product.page_description)
        builder.ele('description').txt(product.page_description).up()
			builder.up()
		}
	}
  // finish the feed up
  builder.end()
}

module.exports = { writeFeed }
