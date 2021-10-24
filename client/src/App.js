import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from 'react-router-dom'
import {ProvideAuth, useAuth} from './hooks/useAuth'

const App = () => {
  return (
    <ProvideAuth>
      <Router>
        <NavBar />
        <Switch>
          <PrivateRoute exact path='/'>
            <Dashboard />
          </PrivateRoute>
          <Route path='/login'>
            <Login />
          </Route>
          <Route path='*'>
            <NoMatch />
          </Route>
        </Switch>
      </Router>
    </ProvideAuth>
  )
}

const PrivateRoute = ({children, ...rest}) => {
  const {user} = useAuth()
  return (
    <Route
      {...rest}
      render={({location}) =>
        user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: {from: location},
            }}
          />
        )
      }
    />
  )
}

const NoMatch = () => {
  const location = useLocation()
  return (
    <div>
      <h3>
        Sorry, no page exists at <code>{location.pathname}</code>
      </h3>
    </div>
  )
}

export default App
