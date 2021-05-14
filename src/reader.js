// Copyright 2021, Antonio Alvarado Hernández

const fetch = require('node-fetch')
const CHUNK_SIZE = 20

async function *readProducts(site, locale, category='root') {
  const options = { headers: { 'x-dw-client-id': process.env.OCAPI_CLIENTID } }
  let promises = []
  let searchURL = makeSearchProductsURL(site, locale, category)
  while (searchURL) {
    const results = await fetch(searchURL, options).then(res => res.json())
    if ('fault' in results)
      throw new Error(results.fault.message)
    const numOfChunks =
      parseInt(results.count/CHUNK_SIZE) + (results.count % CHUNK_SIZE > 0)
    for (let i = 0; i < numOfChunks; i++) {
      const lo = CHUNK_SIZE * i
      const hi = Math.min(lo + CHUNK_SIZE, results.count)
      const hits = results.hits.slice(lo, hi)
      const ids = hits.map(hit => hit.product_id).join(',')
      const productsURL = makeGetProductsURL(site, locale, ids)
      yield fetch(productsURL, options).then(res => res.json())
    }
    searchURL = results.next
  }
}

const makeSearchProductsURL = (site, locale, category) => {
  const version = process.env.OCAPI_VERSION
  const url = new URL(process.env.OCAPI_BASEURL)
  const params = new URLSearchParams({ locale, q: '', refine: `cgid=${category}`,
    count: 200 })
  url.search = params.toString()
  url.pathname = `s/${site}/dw/shop/${version}/product_search`
  return url
}

const makeGetProductsURL = (site, locale, ids) => {
  const version = process.env.OCAPI_VERSION
  const url = new URL(process.env.OCAPI_BASEURL)
  const params = new URLSearchParams({ locale, expand: 'images,availability,prices' })
  url.search = params.toString()
  url.pathname = `s/${site}/dw/shop/${version}/products/(${ids})`
  return url
}

module.exports = { readProducts }
