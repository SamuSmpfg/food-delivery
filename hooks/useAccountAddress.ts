import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-expo'

const API_URL = process.env.EXPO_PUBLIC_API_URL

const formatLocation = (location: any): string => {
  if (!location) return ''
  if (typeof location === 'string') return location
  if (location.formattedAddress) return location.formattedAddress
  if (location.address) return location.address
  const parts = [
    location.street,
    location.district,
    location.city,
    location.region ?? location.state,
  ].filter(Boolean)
  return parts.join(', ')
}

export const useAccountAddress = () => {
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const token = await getToken()

        const res = await fetch(`${API_URL}/api/user/account`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        console.log('address response', res.status, data)

        if (!cancelled) setAddress(formatLocation(data.location ?? data))
      } catch (e) {
        console.log('address error', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user?.id, isLoaded])

  return { address, loading }
}