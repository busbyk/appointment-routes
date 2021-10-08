import React from 'react'

const ControlPanel = ({stops, setFilter}) => {
  const handleFilterClick = (e) => {
    setFilter(e.target.innerText.toLowerCase())
  }

  return (
    <div className='control-panel-container'>
      <h1>Appointments</h1>
      <h3>Filters</h3>
      <button onClick={handleFilterClick}>Today</button>
      <button onClick={handleFilterClick}>Tomorrow</button>
      <h3>Stops</h3>
      {stops && stops.map((stop, idx) => <div key={idx}>{stop.name}</div>)}
      {!stops && <p>No stops scheduled</p>}
    </div>
  )
}

export default ControlPanel
