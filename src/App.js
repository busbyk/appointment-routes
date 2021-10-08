import React, {useState, useEffect} from 'react'
import './App.css'
import Map from './components/Map'
import ControlPanel from './components/ControlPanel'

const initialStops = {
  today: [
    {
      name: 'Alta, UT',
    },
    {
      name: 'Salt Lake City, UT',
    },
    {
      name: 'Provo, UT',
    },
    {
      name: 'Logan, UT',
    },
  ],
  tomorrow: [
    {
      name: 'Alta, UT',
    },
    {
      name: 'Ogden, UT',
    },
  ],
}

function App() {
  const [filter, setFilter] = useState('today')
  const [map, setMap] = useState()
  const [maps, setMaps] = useState()
  const [placesService, setPlacesService] = useState()
  const [directionsService, setDirectionsService] = useState()
  const [directionsRenderer, setDirectionsRenderer] = useState()
  const [stops, setStops] = useState()
  const [filteredStops, setFilteredStops] = useState()
  const [error, setError] = useState()

  const apiIsLoaded = (map, maps) => {
    setMap(map)
    setMaps(maps)
    setPlacesService(new maps.places.PlacesService(map))
    setDirectionsService(new maps.DirectionsService())
    setDirectionsRenderer(new maps.DirectionsRenderer())
  }

  const handleAddStop = (newStopQuery) => {
    const request = {
      query: newStopQuery,
      fields: ['name', 'geometry'],
    }

    let promise = new Promise((resolve, reject) => {
      placesService.findPlaceFromQuery(request, (results, status) => {
        if (status === maps.places.PlacesServiceStatus.OK && results) {
          const location = results[0].geometry.location
          resolve({
            name: results[0].name,
            lat: location.lat(),
            lng: location.lng(),
          })
        } else {
          reject(`Oi, error finding ${request.query} in the places api`)
        }
      })
    })

    promise
      .then((res) => {
        setStops(Object.assign({}, stops, {[filter]: [...stops[filter], res]}))
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useEffect(() => {
    const runEffect = async () => {
      let parsedStops = {}
      for (const filter in initialStops) {
        const pendingQueries = initialStops[filter].map((initialStop) => {
          const request = {
            query: initialStop.name,
            fields: ['name', 'geometry'],
          }
          return new Promise((resolve, reject) => {
            placesService.findPlaceFromQuery(request, (results, status) => {
              if (status === maps.places.PlacesServiceStatus.OK && results) {
                const location = results[0].geometry.location
                resolve({
                  name: initialStop.name,
                  lat: location.lat(),
                  lng: location.lng(),
                })
              } else {
                reject(`Oi, error finding ${request.query} in the places api`)
              }
            })
          })
        })

        await Promise.all(pendingQueries)
          .then((res) => {
            parsedStops[filter] = res
          })
          .catch((err) => {
            console.error(err)
          })
      }
      setStops(parsedStops)
    }

    if (maps && placesService) {
      runEffect()
    }
  }, [maps, placesService])

  useEffect(() => {
    if (stops && stops[filter]) {
      setFilteredStops(stops[filter])
    }
  }, [stops, filter])

  useEffect(() => {
    if (map && maps && filteredStops) {
      const bounds = new maps.LatLngBounds()

      filteredStops.forEach((stop) => {
        bounds.extend(new maps.LatLng(stop.lat, stop.lng))
      })

      map.fitBounds(bounds)
    }
  }, [map, maps, filteredStops])

  useEffect(() => {
    const runEffect = async () => {
      directionsRenderer.setMap(map)

      const latLng = (stop) => new maps.LatLng(stop.lat, stop.lng)

      const directionsRequest = {
        origin: latLng(filteredStops[0]),
        destination: latLng(filteredStops[filteredStops.length - 1]),
        travelMode: maps.TravelMode.DRIVING,
      }

      if (filteredStops.length > 2) {
        let waypoints = []
        for (let i = 1; i < filteredStops.length - 1; i++) {
          waypoints.push({
            location: latLng(filteredStops[i]),
            stopover: true,
          })
        }

        if (waypoints.length > 10) {
          return setError(
            'Cannot have more than 10 waypoints as this exceeds the Google Maps free tier'
          )
        }

        directionsRequest.waypoints = waypoints
        directionsRequest.optimizeWaypoints = true
      }

      directionsService
        .route(directionsRequest)
        .then((res) => {
          console.log(res)
          directionsRenderer.setDirections(res)
        })
        .catch((err) => {
          console.error(`Error getting directions: ${err}`)
        })
    }

    if (
      map &&
      maps &&
      directionsService &&
      directionsRenderer &&
      filteredStops
    ) {
      runEffect()
    }
  }, [map, maps, directionsService, directionsRenderer, filteredStops])

  return (
    <div className='container'>
      <ControlPanel
        stops={filteredStops}
        setFilter={setFilter}
        handleAddStop={handleAddStop}
        error={error}
      />
      <Map stops={filteredStops} apiIsLoaded={apiIsLoaded} />
    </div>
  )
}

export default App
