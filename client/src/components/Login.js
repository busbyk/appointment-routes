import React, {useState} from 'react'
import {useAuth} from '../hooks/useAuth'
import {FaExclamationTriangle, FaEnvelope, FaLock} from 'react-icons/fa'
import validator from 'validator'
import {useHistory} from 'react-router-dom'

const validateRequired = (str) => {
  return str.toString().trim().length
}

const validateEmail = (email) => {
  return validator.isEmail(email)
}

const validatePassword = (password) => {
  return password.toString().trim().length >= 8
}

const Login = () => {
  const {login} = useAuth()
  const history = useHistory()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState()

  const validateEmailField = () => {
    if (!validateRequired(email)) {
      setEmailError('Email is required.')
      return false
    }
    if (!validateEmail(email)) {
      setEmailError(`${email} is an invalid email.`)
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePasswordField = () => {
    if (!validateRequired(password)) {
      setPasswordError('Password is required.')
      return false
    }
    if (!validatePassword(password)) {
      setPasswordError(
        'Invalid password. Password must be at least 8 characters.'
      )
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let shouldSubmit = true

    shouldSubmit = validateEmailField()
    shouldSubmit = validatePasswordField()

    if (shouldSubmit) {
      setLoading(true)
      login(email, password)
        .then(() => {
          setLoading(false)
          history.push('/')
        })
        .catch((err) => {
          setLoading(false)
          setLoginError(err)
        })
    }
  }

  const handleChangeEmail = (e) => {
    setEmail(e.target.value)
  }

  const handleChangePassword = (e) => {
    setPassword(e.target.value)
  }

  return (
    <section className='section px-6'>
      <div className='container is-fluid'>
        <form onSubmit={handleSubmit} noValidate>
          <div className='field'>
            <label className='label'>Email</label>
            <div className='control has-icons-left has-icons-right'>
              <input
                className='input'
                type='email'
                placeholder='Email'
                value={email}
                onChange={handleChangeEmail}
                onBlur={validateEmailField}
              />
              <span className='icon is-small is-left'>
                <FaEnvelope />
              </span>
              {emailError && (
                <span className='icon is-small is-right'>
                  <FaExclamationTriangle />
                </span>
              )}
            </div>
            {emailError && <p className='help is-danger'>{emailError}</p>}
          </div>

          <div className='field'>
            <label className='label'>Password</label>
            <div className='control has-icons-left has-icons-right'>
              <input
                className='input'
                type='password'
                placeholder='Password'
                value={password}
                onChange={handleChangePassword}
                onBlur={validatePasswordField}
              />
              <span className='icon is-small is-left'>
                <FaLock />
              </span>
              {passwordError && (
                <span className='icon is-small is-right'>
                  <FaExclamationTriangle />
                </span>
              )}
            </div>
            {passwordError && <p className='help is-danger'>{passwordError}</p>}
          </div>

          <div className='field is-grouped'>
            <div className='control'>
              <button type='submit' className='button is-link'>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </div>
          {loginError && (
            <div className='notification is-danger'>{loginError}</div>
          )}
        </form>
      </div>
    </section>
  )
}

export default Login
