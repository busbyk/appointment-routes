const express = require('express')
const router = express.Router()

const {Client} = require('@googlemaps/google-maps-services-js')
const client = new Client()

const key = process.env.GOOGLE_MAPS_API_KEY

router.post('/geocode', (req, res) => {
  const address = req.body.address

  if (address) {
    client
      .geocode({
        params: {
          address,
          key,
        },
      })
      .then((result) => {
        const geocodeResult =
          result.data.results.length > 0 ? result.data.results[0] : {}
        const status = result.data.status

        if (geocodeResult && status === 'OK') {
          res.status(200).json({
            formattedAddress: geocodeResult.formatted_address,
            lat: geocodeResult.geometry.location.lat,
            lng: geocodeResult.geometry.location.lng,
          })
        } else {
          console.error(`Error geocoding ${address} - Status: ${status}`)
          res.status(200).json({
            error: status,
          })
        }
      })
      .catch((err) => {
        console.error(err)
        res
          .status(500)
          .json(
            'Internal server error, cannot connect to the Google Geocoding API.'
          )
      })
  } else {
    res.sendStatus(400)
  }
})

router.post('/directions', (req, res) => {
  const directionsRequest = req.body.directionsRequest

  if (directionsRequest) {
    console.log(directionsRequest)
    if (directionsRequest.waypoints) {
      console.log(directionsRequest.waypoints)
    }
    client
      .directions({
        params: {
          ...directionsRequest,
          key,
        },
      })
      .then((result) => {
        console.log(result.data)
        res.status(200).json(result.data)
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(500)
      })
  } else {
    res.sendStatus(400)
  }
})

module.exports = router
