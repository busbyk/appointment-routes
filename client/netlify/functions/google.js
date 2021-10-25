const {Client} = require('@googlemaps/google-maps-services-js')
const client = new Client()

const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY

const sendResponse = (statusCode, body) => {
  return {
    statusCode,
    body: JSON.stringify(body),
  }
}

exports.handler = async function (event) {
  const path = event.path

  if (path.includes('/geocode')) {
    const body = JSON.parse(event.body)
    const address = body.address

    if (address) {
      try {
        const result = await client.geocode({
          params: {
            address,
            key,
          },
        })
        const geocodeResult =
          result.data.results.length > 0 ? result.data.results[0] : {}
        const status = result.data.status

        if (geocodeResult && status === 'OK') {
          return sendResponse(200, {
            formattedAddress: geocodeResult.formatted_address,
            lat: geocodeResult.geometry.location.lat,
            lng: geocodeResult.geometry.location.lng,
          })
        } else {
          console.error(`Error geocoding ${address} - Status: ${status}`)
          return sendResponse(200, {
            error: status,
          })
        }
      } catch (err) {
        console.error(err)
        return sendResponse(
          500,
          'Internal server error, cannot connect to the Google Geocoding API.'
        )
      }
    } else {
      return sendResponse(400, 'address is required.')
    }
  } else if (path.includes('/directions')) {
    const body = JSON.parse(event.body)
    const directionsRequest = body.directionsRequest

    if (directionsRequest) {
      try {
        const result = await client.directions({
          params: {
            ...directionsRequest,
            key,
          },
        })
        return sendResponse(200, {...result.data})
      } catch (err) {
        console.error(err)
        return sendResponse(
          500,
          'Internal server error, cannot connect to the Google Directions API.'
        )
      }
    } else {
      return sendResponse(400, 'directionsRequest is required.')
    }
  } else if (path.includes('/technicians')) {
    console.log('got to technicians path')
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
    return sendResponse(200, dummyData)
  } else {
    return {statusCode: 404}
  }
}
