import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import * as Location from 'expo-location'

export type CartItem = {
  key: string
  id: string
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
}

type AddPayload = {
  id: string
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
  placeOrder: () => void
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

  const addItem = ({ id, name, restaurant = '', price, size = '14"', quantity = 1 }: AddPayload) => {
    const key = `${id}-${size}`
    setItems((current) => {
      const existing = current.find((item) => item.key === key)
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...current, { key, id, name, restaurant, unitPrice: Number(price), size, quantity }]
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

  const placeOrder = () => {
    if (items.length === 0) return
    setOrder({
      id: String(Date.now()),
      items: items.map((item) => ({ ...item })),
      total,
      address,
      placedAt: Date.now(),
    })
    setItems([])
  }

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
    }),
    [items, count, total, address, order]
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