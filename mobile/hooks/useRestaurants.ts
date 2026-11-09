import { useCallback, useEffect, useState } from 'react'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export type ApiRestaurant = {
  _id: string
  ownerId: string
  name: string
  description: string
  image: string
  address: {
    label: string
    street: string
    number: string
    postCode: string
    city: string
    state: string
    location: { lat: number; lng: number }
  }
  specialty: string[]
  deliveryFee: number
  rating: number
  averageDeliveryTime: number
  reviewsCount: number
  isOpen: boolean
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/restaurants`)
      if (!response.ok) throw new Error(`Erro ${response.status}`)
      const data = await response.json()
      setRestaurants(Array.isArray(data) ? data : (data?.restaurants ?? []))
    } catch (e) {
      setRestaurants([])
      setError(e instanceof Error ? e.message : 'Error loading restaurants')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { restaurants, loading, error, reload: load }
}