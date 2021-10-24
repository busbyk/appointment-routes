import React, {useState, useEffect} from 'react'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import {DateUtils} from 'react-day-picker'
import 'react-day-picker/lib/style.css'
import {FaMapMarker} from 'react-icons/fa'

import dateFnsFormat from 'date-fns/format'
import dateFnsParse from 'date-fns/parse'

import {getDirections} from '../API'

const METERS_TO_MILES = 0.000621371192
const MAX_WAYPOINTS = process.env.REACT_APP_MAX_WAYPOINTS || 10

const parseDate = (str, format, locale) => {
  const parsed = dateFnsParse(str, format, new Date(), {locale})
  if (DateUtils.isDate(parsed)) {
    return parsed
  }
  return undefined
}

const formatDate = (date, format, locale) => {
  return dateFnsFormat(date, format, {locale})
}

const Technician = ({
  name,
  addresses,
  error,
  directionsService,
  map,
  maps,
  processed,
  isActive,
  handleClick,
  isSomeTechSelected,
  color,
  dispatchDirectionsStatus,
}) => {
  const [directionsError, setDirectionsError] = useState()
  const [totalMiles, setTotalMiles] = useState()
  const [directionsRenderer, setDirectionsRenderer] = useState()

  useEffect(() => {
    if (!directionsRenderer && isActive && maps) {
      setDirectionsRenderer(
        new maps.DirectionsRenderer({
          polylineOptions: {strokeColor: color, strokeWeight: 5},
          suppressMarkers: true,
        })
      )
    }

    const cleanup = () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null)
      }
    }
    return cleanup
  }, [isActive, directionsRenderer, maps, color])

  useEffect(() => {
    const latLng = (addr) => new maps.LatLng(addr.lat, addr.lng)

    const reformatDirectionsResult = (res) => {
      let newRes = {...res}
      let route = newRes.routes[0]
      let legs = route.legs

      route.legs = legs.map((leg) => {
        leg.start_location = latLng(leg.start_location)
        leg.end_location = latLng(leg.end_location)
        leg.steps = leg.steps.map((step) => {
          step.path = maps.geometry.encoding.decodePath(step.polyline.points)
          step.start_location = latLng(step.start_location)
          step.end_location = latLng(step.end_location)
          return step
        })
        return leg
      })
      route.bounds = new maps.LatLngBounds(
        route.bounds.southwest,
        route.bounds.northeast
      )
      route.overview_path = maps.geometry.encoding.decodePath(
        route.overview_polyline.points
      )
      return newRes
    }

    const reformatDirectionsRequest = (directionsRequest) => {
      return {
        origin: latLng(directionsRequest.origin),
        destination: latLng(directionsRequest.destination),
        travelMode: directionsRequest.travelMode,
      }
    }

    if (
      directionsService &&
      directionsRenderer &&
      map &&
      maps &&
      processed &&
      addresses.length > 1 &&
      !error
    ) {
      if (!isActive) {
        if (directionsRenderer) {
          directionsRenderer.setMap(null)
        }
      } else {
        if (!directionsRenderer.getMap()) {
          directionsRenderer.setMap(map)

          const directionsRequest = {
            origin: latLng(addresses[0].googlePlace),
            destination: latLng(addresses[addresses.length - 1].googlePlace),
            travelMode: maps.TravelMode.DRIVING,
          }

          if (addresses.length > 2) {
            let waypoints = []
            for (let i = 1; i < addresses.length - 1; i++) {
              waypoints.push(latLng(addresses[i].googlePlace))
            }

            if (waypoints.length > MAX_WAYPOINTS) {
              return setDirectionsError(
                `Cannot have more than ${MAX_WAYPOINTS} waypoints as this exceeds configured max waypoints limit.`
              )
            }

            directionsRequest.waypoints = waypoints
            directionsRequest.optimizeWaypoints = true
          }

          getDirections(directionsRequest)
            .then((res) => {
              const legs = res.routes[0].legs
              const totalDistanceInMeters = legs.reduce(
                (acc, cur) => (acc += cur.distance.value),
                0
              )
              const totalDistanceInMiles =
                Math.round(totalDistanceInMeters * METERS_TO_MILES * 10) / 10
              setTotalMiles(totalDistanceInMiles)

              const formattedResponse = reformatDirectionsResult(res)
              const formattedRequest =
                reformatDirectionsRequest(directionsRequest)

              directionsRenderer.setDirections({
                ...formattedResponse,
                request: formattedRequest,
              })
              console.log('rendered directions')
              dispatchDirectionsStatus('rendered')
            })
            .catch((err) => {
              console.error(`Error getting directions: ${err}`)
              dispatchDirectionsStatus('failed')
            })
        }
      }
    }
  }, [
    directionsService,
    directionsRenderer,
    map,
    maps,
    addresses,
    processed,
    isActive,
    error,
    dispatchDirectionsStatus,
  ])

  const startingLocation = addresses[0].address
  const numStops = addresses.length

  return (
    <div
      className={`block is-clickable technician ${
        isActive && isSomeTechSelected
          ? 'has-background-info-dark has-text-light'
          : ''
      }`}
      onClick={handleClick}
    >
      <div className='media pl-3 p-2'>
        <div className='media-content'>
          <p
            className={`title is-5 ${
              isActive && isSomeTechSelected ? 'has-text-light' : ''
            }`}
          >
            {name}
          </p>
          <p
            className={`subtitle is-6 mb-1 ${
              isActive && isSomeTechSelected ? 'has-text-light' : ''
            }`}
          >
            {totalMiles ? `${totalMiles} Miles` : '...'} | {numStops} Stops
          </p>
          <p>
            <FaMapMarker style={{color: color}} /> {startingLocation}
          </p>
          {error && (
            <p className='help is-danger'>{`There was an error processing this technician's addresses: ${error}`}</p>
          )}
          {directionsError && (
            <p className='help is-danger'>{`There was an error rendering directions for this technician's route: ${error}`}</p>
          )}
        </div>
      </div>
    </div>
  )
}

const ControlPanel = ({
  date,
  setDate,
  error,
  techsLoading,
  techs,
  directionsService,
  map,
  maps,
  handleClickTechnician,
  handleClickShowAllTechnicians,
  dispatchDirectionsStatus,
}) => {
  const FORMAT = 'MM/dd/yyyy'
  const [dateError, setDateError] = useState()

  const handleDayChange = (selectedDay, modifiers, dayPickerInput) => {
    const input = dayPickerInput.getInput()

    if (input.value.trim() && modifiers.disabled !== true) {
      setDate(selectedDay)
    } else {
      setDateError('Invalid date selection')
    }
  }

  const isSomeTechSelected = techs
    ? techs.some((tech) => !tech.isActive)
    : false

  return (
    <div className='control-panel-container'>
      <h4 className='title is-4'>Date</h4>
      <DayPickerInput
        formatDate={formatDate}
        format={FORMAT}
        parseDate={parseDate}
        value={`${dateFnsFormat(date, FORMAT)}`}
        onDayChange={handleDayChange}
      />
      <button
        className='button is-link is-inverted is-small'
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
      {dateError && <div className='notification is-danger'>{dateError}</div>}
      <h4 className='title is-4 mt-3'>Technicians</h4>
      {isSomeTechSelected && (
        <button onClick={handleClickShowAllTechnicians} className='button mb-3'>
          Show All Technicians
        </button>
      )}
      <div className='technician-list'>
        {techsLoading && <span className='bulma-loader-mixin'></span>}
        {!techsLoading &&
          techs &&
          techs.map((tech, idx) => (
            <Technician
              {...tech}
              key={idx}
              directionsService={directionsService}
              map={map}
              maps={maps}
              handleClick={() => handleClickTechnician(idx)}
              isSomeTechSelected={isSomeTechSelected}
              dispatchDirectionsStatus={(status) => {
                dispatchDirectionsStatus({
                  type: 'update',
                  payload: {idx, status},
                })
              }}
            />
          ))}
        {error && <div className='notification is-danger'>{error}</div>}
      </div>
    </div>
  )
}

export default ControlPanel
