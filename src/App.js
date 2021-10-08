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
  const [stops, setStops] = useState()
  const [filteredStops, setFilteredStops] = useState()

  const apiIsLoaded = (map, maps) => {
    setMap(map)
    setMaps(maps)
    setPlacesService(new maps.places.PlacesService(map))
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

  return (
    <div className='container'>
      <ControlPanel stops={filteredStops} setFilter={setFilter} />
      <Map stops={filteredStops} apiIsLoaded={apiIsLoaded} />
    </div>
  )
}

export default App
