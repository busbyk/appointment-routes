import React, {useState, useContext, createContext} from 'react'
import jwtDecode from 'jwt-decode'
import jwt from 'jsonwebtoken'
import {v4 as uuid} from 'uuid'

const authContext = createContext()

export const ProvideAuth = ({children}) => {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export const useAuth = () => {
  return useContext(authContext)
}

const useProvideAuth = () => {
  const [user, setUser] = useState(getCurrentUser())

  const register = () => {}

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      const token = jwt.sign({userId: uuid(), email}, 'tempstring', {
        expiresIn: '24h',
      })
      const user = {
        email,
        token,
      }
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
      resolve(user)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return {
    user,
    register,
    login,
    logout,
  }
}

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (user) {
    const decodedJwt = jwtDecode(user.token)

    if (decodedJwt.exp * 1000 < Date.now()) {
      return null
    }
    return user
  }

  return null
}
