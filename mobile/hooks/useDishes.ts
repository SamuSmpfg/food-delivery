import { useEffect, useState } from 'react'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export type ApiDishSize = { label: string; price: number }
export type ApiDishIngredient = { name: string; kind: string }

export type ApiDish = {
  _id: string
  restaurantId: string
  name: string
  description: string
  image: string
  category: string[]
  classification: string
  deliveryMode: string
  sizes: ApiDishSize[]
  ingredients: ApiDishIngredient[]
  avgPrepMinutes: number
  rating: number
  reviewsCount: number
  orderCount: number
}

export function useDishesState() {
  const [dishes, setDishes] = useState<ApiDish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch(`${API_URL}/api/dishes`)
      .then(async (r) => {
        const body = await r.json().catch(() => null)
        return r.ok ? body : []
      })
      .then((data) => { if (active) setDishes(Array.isArray(data) ? data : []) })
      .catch((e) => {
        if (active) setDishes([])
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  return { dishes, loading }
}

export function useDishes() {
  return useDishesState().dishes
}