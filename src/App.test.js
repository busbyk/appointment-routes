import {render, screen} from '@testing-library/react'
import App from './App'

test('renders', () => {
  render(<App />)
  const appointmentHeader = screen.getByText('Appointments')
  expect(appointmentHeader).toBeInTheDocument()
})
