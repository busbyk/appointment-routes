import {render, screen} from '@testing-library/react'
import App from './App'

test('renders learn react link', () => {
  render(<App />)
  const titleElement = screen.getByText('MERN Stack Template')
  expect(titleElement).toBeInTheDocument()
})
