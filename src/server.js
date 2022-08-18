// Copyright (c) 2021-2022, Antonio Alvarado Hernández

const express = require('express')
const app = express()

const { writeFeed } = require('./writer.js')

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const readConfiguration = () => {
    const dirname = process.env.CONFIG_DIRNAME || `__dirname/../config/`
    const globPattern = path.resolve(`${dirname}/**.json`)
    return glob.sync(globPattern)
      .map(filename => JSON.parse(fs.readFileSync(filename, 'utf-8') || {}))
      .reduce((total, partial) => Object.assign(total, partial || {}))
}
const configuration = readConfiguration()

for (const uri in configuration) {
  app.get(uri, (req, res) => {
    res.set('Content-Type', 'text/xml')
    writeFeed(res, configuration[uri] || {})
  })
}

const env = process.env.NODE_ENV || 'development'
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || env === 'development' ? 8080 : 80

const start = async () => {
  app.listen(port, host, () => {
    console.log(`Serving feeds at http://${host}:${port}`)
  })
}

module.exports = { start }
