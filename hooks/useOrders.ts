import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-expo'

export type OrderStatus = 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled'

export type Order = {
  _id: string
  restaurantName: string
  total: number
  itemsCount: number
  status: OrderStatus
  createdAt: string
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
      if (!response.ok) throw new Error(`Erro ${response.status} ao carregar os pedidos`)
      const data: Order[] = await response.json()
      setOrders(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os pedidos')
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

  return { orders, loading, error, refetch, cancelOrder }
}

export default useOrders