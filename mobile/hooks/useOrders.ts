import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-expo'

export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'

export type OrderItem = {
  dishId: string
  name: string
  size?: string
  unitPrice?: number
  quantity: number
}

export type Order = {
  _id: string
  restaurantName: string
  total: number
  itemsCount: number
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
}

const useOrders = () => {
  const { getToken } = useAuth()
  const getTokenRef = useRef(getToken)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTokenRef.current = getToken
  }, [getToken])

  const refetch = useCallback(async () => {
    try {
      const token = await getTokenRef.current()
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`Error ${response.status} loading orders`)
      const data: Order[] = await response.json()
      setOrders(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelOrder = useCallback(async (id: string) => {
    const token = await getTokenRef.current()
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('cancel failed')
    setOrders((prev) =>
      prev.map((order) =>
        order._id === id ? { ...order, status: 'cancelled' } : order
      )
    )
  }, [])

  const completeOrder = useCallback(async (id: string) => {
    const token = await getTokenRef.current()
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('complete failed')
    setOrders((prev) =>
      prev.map((order) =>
        order._id === id ? { ...order, status: 'delivered' } : order
      )
    )
  }, [])

  const completeLatestOrder = useCallback(async () => {
    const token = await getTokenRef.current()
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('load failed')
    const data: Order[] = await response.json()
    const target = data.find(
      (order) => order.status !== 'delivered' && order.status !== 'cancelled'
    )
    if (target) await completeOrder(target._id)
  }, [completeOrder])

  return { orders, loading, error, refetch, cancelOrder, completeOrder, completeLatestOrder }
}

export default useOrders