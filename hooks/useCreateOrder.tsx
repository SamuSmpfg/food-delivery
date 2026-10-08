import { useCallback, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import type { Order } from './useOrders'

type NewOrder = {
  restaurantName: string
  total: number
  itemsCount: number
}

const useCreateOrder = () => {
  const { getToken } = useAuth()
  const getTokenRef = useRef(getToken)

  useEffect(() => {
    getTokenRef.current = getToken
  }, [getToken])

  const createOrder = useCallback(async (data: NewOrder): Promise<Order> => {
    const token = await getTokenRef.current()
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Erro ${response.status} ao criar o pedido`)
    return response.json()
  }, [])

  return { createOrder }
}

export default useCreateOrder