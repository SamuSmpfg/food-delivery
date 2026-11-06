import { useCallback, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import type { Order } from './useOrders'

type NewOrderItem = {
  dishId: string
  size?: string
  quantity: number
}

type NewOrder = {
  restaurantId: string
  items: NewOrderItem[]
}

type CreatedOrder = Order & { estimatedMinutes: number }

const useCreateOrder = () => {
  const { getToken } = useAuth()
  const getTokenRef = useRef(getToken)

  useEffect(() => {
    getTokenRef.current = getToken
  }, [getToken])

  const createOrder = useCallback(async (data: NewOrder): Promise<CreatedOrder> => {
    const token = await getTokenRef.current()
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(body?.message ?? `Erro ${response.status} ao criar o pedido`)
    }
    return body
  }, [])

  return { createOrder }
}

export default useCreateOrder