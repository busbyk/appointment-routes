import React, {useState, useEffect, useCallback, useReducer} from 'react'
import Map from './Map'
import ControlPanel from './ControlPanel'
import {getTechsByDate} from '../API'

import dateFnsFormat from 'date-fns/format'
import randomColor from 'randomcolor'
import {cloneDeep} from 'lodash'

import {geocodeAddress} from '../API'

const DATE_FORMAT = 'MM-dd-yyyy'

const generateRandomColor = () => randomColor({luminosity: 'dark'})

const directionsStatusReducer = (state, action) => {
  const {payload, type} = action

  switch (type) {
    case 'update':
      const updatedState = cloneDeep(state)
      updatedState[payload.idx] = payload.status
      return updatedState
    case 'init':
      return payload
    default:
      throw new Error()
  }
}

const getDateStringFromUrlParam = () => {
  const url = new URL(window.location)
  return url.searchParams.get('date')
}

const setDateStringInUrlParam = (date) => {
  const url = new URL(window.location)
  url.searchParams.set('date', dateFnsFormat(date, DATE_FORMAT))
  window.history.pushState({}, '', url)
}

const Dashboard = () => {
  const [date, setDate] = useState(() => {
    const dateParam = getDateStringFromUrlParam()

    if (dateParam) {
      try {
        return new Date(dateParam)
      } catch (err) {
        console.error('invalid format of the url param, date')
        const date = new Date()
        setDateStringInUrlParam(date)
        return date
      }
    } else {
      const date = new Date()
      setDateStringInUrlParam(date)
      return date
    }
  })
  const [techs, setTechs] = useState()
  const [techsLoading, setTechsLoading] = useState(true)

  const [map, setMap] = useState()
  const [maps, setMaps] = useState()
  const [placesService, setPlacesService] = useState()
  const [directionsService, setDirectionsService] = useState()

  const [error, setError] = useState()
  const [isMapReady, setIsMapReady] = useState(false)

  const [directionsStatus, dispatchDirectionsStatus] = useReducer(
    directionsStatusReducer,
    []
  )

  const apiIsLoaded = (map, maps) => {
    setMap(map)
    setMaps(maps)
    setPlacesService(new maps.places.PlacesService(map))
    setDirectionsService(new maps.DirectionsService())
  }

  const fitAddressBounds = useCallback(() => {
    const bounds = new maps.LatLngBounds()

    techs.forEach((tech) => {
      if (!tech.error && tech.isActive) {
        tech.addresses.forEach(({googlePlace}) => {
          bounds.extend(new maps.LatLng(googlePlace.lat, googlePlace.lng))
        })
      }
    })

    map.fitBounds(bounds)
  }, [map, maps, techs])

  const handleClickShowAllTechnicians = () => {
    setIsMapReady(false)
    dispatchDirectionsStatus({
      type: 'init',
      payload: techs.map((tech) => {
        if (tech.isActive) {
          return 'rendered'
        } else if (tech.error) {
          return 'aborted'
        } else {
          return 'pending'
        }
      }),
    })

    const newTechs = techs.map((tech) => {
      return {
        ...tech,
        isActive: true,
      }
    })
    setTechs(newTechs)
  }

  const handleClickTechnician = (clickedIdx) => {
    const newTechs = techs.map((tech, idx) => {
      return {
        ...tech,
        isActive: clickedIdx === idx,
      }
    })
    setTechs(newTechs)
    fitAddressBounds()
  }

  const handleSetDate = (date) => {
    setDate(date)
    setDateStringInUrlParam(date)
  }

  useEffect(() => {
    setIsMapReady(false)
    setTechsLoading(true)
    getTechsByDate(date)
      .then((techs) => {
        setTechs(
          techs.map((tech) => {
            return {
              ...tech,
              isActive: true,
              color: generateRandomColor(),
            }
          })
        )
        if (techs.length === 0) {
          setError(
            `No technician route data is available for ${dateFnsFormat(
              date,
              DATE_FORMAT
            )}`
          )
          setIsMapReady(true)
        } else {
          setError(null)
          dispatchDirectionsStatus({
            type: 'init',
            payload: techs.map(() => 'pending'),
          })
        }
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setTechsLoading(false)
      })
  }, [date])

  useEffect(() => {
    const runEffect = async () => {
      const techsPendingProcessing = Promise.allSettled(
        techs.map((tech) => {
          return new Promise((resolve, reject) => {
            const pendingAddresses = Promise.all(
              tech.addresses.map((addr) => {
                return new Promise((resolveAddr, rejectAddr) => {
                  const placeQueryPromise = geocodeAddress(addr.address)

                  placeQueryPromise
                    .then((place) => {
                      resolveAddr({
                        ...addr,
                        googlePlace: place,
                      })
                    })
                    .catch((err) => {
                      rejectAddr(err)
                    })
                })
              })
            )

            pendingAddresses
              .then((addrs) => {
                resolve(
                  Object.assign({}, tech, {addresses: addrs, processed: true})
                )
              })
              .catch((err) => {
                reject(Object.assign({}, tech, {processed: true, error: err}))
              })
          })
        })
      )

      techsPendingProcessing.then((results) => {
        setTechs(
          results.map((result, idx) => {
            if (result.status === 'fulfilled') {
              return result.value
            } else {
              dispatchDirectionsStatus({
                type: 'update',
                payload: {idx, status: 'aborted'},
              })
              return result.reason
            }
          })
        )
      })
    }

    if (
      techs &&
      maps &&
      placesService &&
      !techs.every((tech) => tech.processed)
    ) {
      runEffect()
    }
  }, [techs, maps, placesService])

  useEffect(() => {
    if (
      directionsStatus &&
      directionsStatus.length > 0 &&
      directionsStatus.every((status) => status !== 'pending') &&
      techs &&
      techs.length > 0 &&
      techs.every((tech) => tech.processed)
    ) {
      setTimeout(() => {
        fitAddressBounds()
        setIsMapReady(true)
      }, 200)
    }
  }, [directionsStatus, fitAddressBounds, techs])

  return (
    <div className='dashboard-container'>
      <ControlPanel
        date={date}
        setDate={handleSetDate}
        error={error}
        techsLoading={techsLoading}
        techs={techs}
        directionsService={directionsService}
        map={map}
        maps={maps}
        handleClickTechnician={handleClickTechnician}
        handleClickShowAllTechnicians={handleClickShowAllTechnicians}
        dispatchDirectionsStatus={dispatchDirectionsStatus}
      />
      <div className='map-area-container'>
        <Map apiIsLoaded={apiIsLoaded} isMapReady={isMapReady} techs={techs} />
      </div>
    </div>
  )
}

export default Dashboard
