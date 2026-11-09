import { useState } from 'react'
import * as Location from 'expo-location'

const useLocation = () => {
  const [errorMessage, setErrorMessage] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setErrorMessage('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLatitude(location.coords.latitude)
      setLongitude(location.coords.longitude)
      setErrorMessage('')
    } catch {
      setErrorMessage('Could not get your location')
    }
  }

  return { latitude, longitude, errorMessage, getLocation }
}

export default useLocation