import React, {useState} from 'react'
import {MdAddCircle, MdRemoveCircle} from 'react-icons/md'

const AddStop = ({handleAddStop}) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [input, setInput] = useState('')

  const handleChangeInput = (e) => {
    setInput(e.target.value)
  }

  const handleInitiateAddStop = () => {
    handleAddStop(input)
    setInput('')
    setIsFormOpen(false)
  }

  return (
    <div className='add-stop'>
      <button
        onClick={() => {
          setIsFormOpen(!isFormOpen)
          if (isFormOpen) {
            setInput('')
          }
        }}
      >
        {isFormOpen ? <MdRemoveCircle /> : <MdAddCircle />}{' '}
        {isFormOpen ? 'Cancel' : 'Add Stop'}
      </button>
      {isFormOpen && (
        <div>
          <input
            type='text'
            placeholder='Somewhere, USA'
            onChange={handleChangeInput}
            value={input}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleInitiateAddStop()
              }
            }}
          />
          <button onClick={handleInitiateAddStop}>Add Stop</button>
        </div>
      )}
    </div>
  )
}

const ControlPanel = ({stops, setFilter, handleAddStop, error}) => {
  const handleFilterClick = (e) => {
    setFilter(e.target.innerText.toLowerCase())
  }

  return (
    <div className='control-panel-container'>
      <h1>Appointments</h1>
      <h3>Filters</h3>
      <div className='btns'>
        <button onClick={handleFilterClick}>Today</button>
        <button onClick={handleFilterClick}>Tomorrow</button>
      </div>
      <h3>Stops</h3>
      {stops && stops.map((stop, idx) => <div key={idx}>{stop.name}</div>)}
      {!stops && <p>No stops scheduled</p>}
      <AddStop handleAddStop={handleAddStop} />
      {error && (
        <div className='error-container'>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default ControlPanel
