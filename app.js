const express = require('express')
const app = express()
require('dotenv').config()
const {PORT} = require('./config/default')
const path = require('path')
const cors = require('cors')
const googleRoutes = require('./route/google')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/api/ping', (req, res) => {
  res.send('pong')
})

app.get('/api/technicians', (req, res) => {
  const dummyData = [
    {
      name: 'Sally Doe',
      address_1: 'Park City, UT',
      address_2: 'Heber City, UT',
      address_3: 'Midway, UT',
    },
    {
      name: 'John Doe',
      address_1: 'Park City, UT',
      address_2: 'Logan, UT',
    },
    {
      name: 'Jordan Doe',
      address_1: 'Park City, UT',
      address_2: 'Antelope Island, UT',
      address_3: 'Ogden, UT',
    },
  ]
  res.status(200).json(dummyData)
})

app.use('/api/google', googleRoutes)

const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

if (isProduction()) {
  app.use(express.static(path.join(__dirname, 'client/build')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'))
  })
}

const port = isProduction() ? PORT : 3001
app.listen(port, () => console.log(`Server is running on port ${port}!`))
