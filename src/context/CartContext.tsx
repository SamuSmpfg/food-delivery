import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import * as Location from 'expo-location'
import useOrders from '../../hooks/useOrders'

export type CartItem = {
  key: string
  id: string
  restaurantId: string
  name: string
  restaurant: string
  unitPrice: number
  size: string
  quantity: number
}

export type Order = {
  id: string
  items: CartItem[]
  total: number
  address: string
  placedAt: number
  etaMinutes: number
}

type AddPayload = {
  id: string
  restaurantId?: string
  name: string
  restaurant?: string
  price: number | string
  size?: string
  quantity?: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  address: string
  order: Order | null
  setAddress: (value: string) => void
  addItem: (payload: AddPayload) => void
  changeQuantity: (key: string, delta: number) => void
  removeItem: (key: string) => void
  clear: () => void
  placeOrder: (etaMinutes?: number) => void
  completeOrder: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const formatAddress = (place: Location.LocationGeocodedAddress) => {
  const street = [place.street ?? place.name, place.streetNumber].filter(Boolean).join(' ')
  return [street, place.district, place.city, place.region].filter(Boolean).join(', ')
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [address, setAddress] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const { completeLatestOrder } = useOrders()
  const completedOrderId = useRef<string | null>(null)

  useEffect(() => {
    let active = true

    const loadAddress = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync()
        if (status !== 'granted') return

        const position = await Location.getCurrentPositionAsync({})
        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })

        if (!active || !place) return

        const line = formatAddress(place)
        if (line) setAddress((current) => current || line)
      } catch {
        return
      }
    }

    loadAddress()

    return () => {
      active = false
    }
  }, [])

  const addItem = ({
    id,
    restaurantId = '',
    name,
    restaurant = '',
    price,
    size = '',
    quantity = 1
  }: AddPayload) => {
    const key = `${id}-${size}`
    setItems((current) => {
      const existing = current.find((item) => item.key === key)
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [
        ...current,
        { key, id, restaurantId, name, restaurant, unitPrice: Number(price), size, quantity }
      ]
    })
  }

  const changeQuantity = (key: string, delta: number) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }

  const removeItem = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  const clear = () => setItems([])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  )

  const placeOrder = (etaMinutes?: number) => {
    if (items.length === 0) return
    const orderItems = items.map((item) => ({ ...item }))
    setOrder({
      id: String(Date.now()),
      items: orderItems,
      total,
      address,
      placedAt: Date.now(),
      etaMinutes: etaMinutes && etaMinutes > 0 ? etaMinutes : 30
    })
    setItems([])
  }

  const completeOrder = useCallback(async () => {
    if (!order || completedOrderId.current === order.id) return
    completedOrderId.current = order.id
    try {
      await completeLatestOrder()
    } catch {
      completedOrderId.current = null
    }
  }, [order, completeLatestOrder])

  const completeOrderRef = useRef(completeOrder)
  useEffect(() => {
    completeOrderRef.current = completeOrder
  }, [completeOrder])

  useEffect(() => {
    if (!order) return
    const remainingMs = Math.max(0, order.placedAt + order.etaMinutes * 60000 - Date.now())
    const timer = setTimeout(() => completeOrderRef.current(), remainingMs)
    return () => clearTimeout(timer)
  }, [order])

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      address,
      order,
      setAddress,
      addItem,
      changeQuantity,
      removeItem,
      clear,
      placeOrder,
      completeOrder,
    }),
    [items, count, total, address, order, completeOrder]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}