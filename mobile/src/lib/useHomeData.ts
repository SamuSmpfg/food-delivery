import { useCallback, useEffect, useState } from 'react'
import { getJson } from './api'

export type ApiRestaurant = {
  _id: string
  name: string
  description?: string
  image?: string
  deliveryFee: number
  rating: number
  averageDeliveryTime: number
  reviewsCount?: number
  isOpen?: boolean
}

export type ApiSize = { label: string; price: number }

export type ApiIngredient = { name: string; kind: string }

export type ApiDish = {
  _id: string
  name: string
  description?: string
  image?: string
  category: string
  classification?: string
  deliveryMode?: string
  sizes: ApiSize[]
  ingredients: ApiIngredient[]
  avgPrepMinutes?: number
  rating?: number
  reviewsCount?: number
  orderCount?: number
  restaurantId: string | { _id: string }
}

export const dishRestaurantId = (dish: ApiDish): string =>
  typeof dish.restaurantId === 'string' ? dish.restaurantId : dish.restaurantId._id

export const startingPrice = (dish: ApiDish): number =>
  dish.sizes?.length ? Math.min(...dish.sizes.map((size) => size.price)) : 0

export const formatDeliveryFee = (fee: number): string =>
  fee > 0 ? `$${fee.toFixed(2)}` : 'Free'

const unwrapList = <T,>(payload: unknown, key: string): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  const wrapped = payload as Record<string, unknown> | null
  if (Array.isArray(wrapped?.[key])) return wrapped![key] as T[]
  if (Array.isArray(wrapped?.data)) return wrapped!.data as T[]
  return []
}

export const useHomeData = () => {
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([])
  const [dishes, setDishes] = useState<ApiDish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [restaurantsData, dishesData] = await Promise.all([
        getJson<unknown>('/api/restaurants'),
        getJson<unknown>('/api/dishes')
      ])
      setRestaurants(unwrapList<ApiRestaurant>(restaurantsData, 'restaurants'))
      setDishes(unwrapList<ApiDish>(dishesData, 'dishes'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { restaurants, dishes, loading, error, reload }
}