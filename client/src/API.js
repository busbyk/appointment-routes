import axios from 'axios'
import dateFnsFormat from 'date-fns/format'

const USE_NETLIFY_FUNCTIONS = process.env.REACT_APP_USE_NETLIFY_FUNCTIONS
const GOOGLE_PROXY_BASE_URL =
  USE_NETLIFY_FUNCTIONS === 'true'
    ? '/.netlify/functions/google'
    : '/api/google'

const generateAddressArr = (tech) => {
  const address_regex = /(address_)(\d)+/

  let addresses = []

  Object.keys(tech).forEach((key) => {
    const result = address_regex.exec(key)

    if (result) {
      addresses.push({
        idx: result[2],
        address: tech[key],
      })
    }
  })

  return addresses.sort((a, b) => a - b)
}

export const getTechsByDate = async (date) => {
  const endpoint = 'technicians'
  const url = `${GOOGLE_PROXY_BASE_URL}/${endpoint}`
  const formattedDate = dateFnsFormat(date, 'yyyy-MM-dd')

  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url, {
        params: {
          date: formattedDate,
        },
      })
      if (response.data) {
        const techs = response.data
        resolve(
          techs.map((tech) => {
            return {
              ...tech,
              addresses: generateAddressArr(tech),
            }
          })
        )
      } else {
        resolve([])
      }
    } catch (err) {
      reject(err)
    }
  })
}

export const geocodeAddress = (address) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(`${GOOGLE_PROXY_BASE_URL}/geocode`, {
        address,
      })

      if (response && response.data && !response.data.error) {
        resolve(response.data)
      } else {
        switch (response.data.error) {
          case 'ZERO_RESULTS':
            reject(
              `No results found for ${address} in the Google Geocoding API.`
            )
            break
          case 'OVER_QUERY_LIMIT':
          case 'OVER_DAILY_LIMIT':
            reject(
              `This app has exceeded a Google Geocoding API enforced quota.`
            )
            break
          case 'INVALID_REQUEST':
            reject(
              `An address or addresses associated with this technician are in an invalid format or missing.`
            )
            break
          default:
            reject(
              `Something unexpected went wrong geocoding ${address}. Please reload the page to try again.`
            )
        }
      }
    } catch (err) {
      reject(err)
    }
  })
}

export const getDirections = (directionsRequest) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(`${GOOGLE_PROXY_BASE_URL}/directions`, {
        directionsRequest,
      })
      if (response.data) {
        resolve(response.data)
      } else {
        resolve()
      }
    } catch (err) {
      reject(err)
    }
  })
}
