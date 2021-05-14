// Copyright 2021, Antonio Alvarado Hernández

const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send('Hello, world!')
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
