import React from 'react'
import GoogleMapReact from 'google-map-react'

const MARKER_HEIGHT = 35
const MARKER_WIDTH = MARKER_HEIGHT

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY

const Marker = ({text}) => (
  <div
    style={{
      position: 'absolute',
      width: MARKER_WIDTH,
      height: MARKER_HEIGHT,
      top: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: '50% 0 50% 50%',
      padding: 10,
      textAlign: 'center',
      verticalAlign: 'center',
      boxShadow: '2px 2px 2px grey',
    }}
  >
    {text}
  </div>
)

const Map = ({stops, apiIsLoaded}) => {
  const defaultProps = {
    center: {
      lat: 40.5884259,
      lng: -111.6407694,
    },
    zoom: 14,
  }

  return (
    <div style={{height: '100vh', width: '100%'}}>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: GOOGLE_MAPS_API_KEY,
          libraries: ['places'],
        }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({map, maps}) => apiIsLoaded(map, maps)}
      >
        {stops &&
          stops.map((stop, idx) => (
            <Marker lat={stop.lat} lng={stop.lng} text={stop.name} key={idx} />
          ))}
      </GoogleMapReact>
    </div>
  )
}

export default Map
