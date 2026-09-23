import { useState } from 'react'
import * as Location from 'expo-location'

const useLocation = () => {
  const [errorMessage, setErrorMessage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      setErrorMessage('Permission to access location was denied')
      return
    }

    const location = await Location.getCurrentPositionAsync({})
    setLatitude(String(location.coords.latitude))
    setLongitude(String(location.coords.longitude))
    setErrorMessage('')
  }

  return { latitude, longitude, errorMessage, getLocation }
}

export default useLocation