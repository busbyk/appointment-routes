import React, {useState, useEffect} from 'react'
import GoogleMapReact from 'google-map-react'

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY
const GOOGLE_MAP_STARTING_LAT = process.env.REACT_APP_GOOGLE_MAP_STARTING_LAT
const GOOGLE_MAP_STARTING_LNG = process.env.REACT_APP_GOOGLE_MAP_STARTING_LNG
const GOOGLE_MAP_STARTING_ZOOM = process.env.REACT_APP_GOOGLE_MAP_STARTING_ZOOM

const Marker = ({text, color, $hover, name}) => (
  <div className='marker' style={{backgroundColor: color}}>
    {$hover && (
      <div className='tooltip' style={{backgroundColor: color}}>
        {name}
      </div>
    )}
    {text}
  </div>
)

const Map = ({apiIsLoaded, isMapReady, techs}) => {
  const [markers, setMarkers] = useState()

  const defaultProps = {
    center: {
      lat: parseFloat(GOOGLE_MAP_STARTING_LAT),
      lng: parseFloat(GOOGLE_MAP_STARTING_LNG),
    },
    zoom: parseInt(GOOGLE_MAP_STARTING_ZOOM),
  }

  useEffect(() => {
    let markers = []
    if (techs && techs.every((tech) => tech.processed)) {
      techs.forEach((tech) => {
        if (!tech.error && tech.isActive) {
          tech.addresses.forEach((addr, idx) => {
            markers.push({
              text: idx + 1,
              color: tech.color,
              lat: addr.googlePlace.lat,
              lng: addr.googlePlace.lng,
              name: tech.name,
            })
          })
        }
      })
    }
    setMarkers(markers)
  }, [techs])

  return (
    <div className='map'>
      {!isMapReady && (
        <div className='bulma-overlay-mixin'>
          <span className='bulma-loader-mixin'></span>
        </div>
      )}
      <GoogleMapReact
        bootstrapURLKeys={{
          key: GOOGLE_MAPS_API_KEY,
          libraries: ['places', 'geometry'],
        }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        hoverDistance={30}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({map, maps}) => apiIsLoaded(map, maps)}
      >
        {markers &&
          markers.length > 1 &&
          markers.map((marker, idx) => <Marker {...marker} key={idx} />)}
      </GoogleMapReact>
    </div>
  )
}

export default Map
