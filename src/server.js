// Copyright 2021, Antonio Alvarado Hernández

const express = require('express')
const app = express()

const { writeFeed } = require('./writer.js')

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/xml')
  const headers = {
    title: 'Salesforce SiteGenesis',
    link: 'http://demo-ocapi.demandware.net',
    description: 'The website with best products at low prices.',
  }
  writeFeed(res, 'SiteGenesis', 'en-US', headers)
})

const start = async () => {
  const env = process.env.NODE_ENV || 'development'
  const host = process.env.HOST || '0.0.0.0'
  const port = process.env.PORT || env === 'development' ? 8080 : 80
  app.listen(port, host, () => {
    console.log(`Serving feeds at http://${host}:${port}`)
  })
}

module.exports = { start }
