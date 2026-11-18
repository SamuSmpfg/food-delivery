import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-expo'

export type CardBrand = 'visa' | 'mastercard'

export type SavedCard = {
  _id: string
  brand: CardBrand
  holder: string
  last4: string
}

const API = `${process.env.EXPO_PUBLIC_API_URL}/api/cards`

export const useSavedCards = () => {
  const { getToken, isSignedIn } = useAuth()
  const getTokenRef = useRef(getToken)
  const [cards, setCards] = useState<SavedCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTokenRef.current = getToken
  }, [getToken])

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getTokenRef.current()
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init?.headers
      }
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) throw new Error(body?.message ?? `Erro ${response.status}`)
    return body
  }, [])

  const refresh = useCallback(async () => {
    try {
      setCards(await request(''))
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    if (isSignedIn) refresh().catch(() => setLoading(false))
  }, [isSignedIn, refresh])

  const addCard = useCallback(
    async (card: Omit<SavedCard, '_id'>) => {
      const saved: SavedCard = await request('', { method: 'POST', body: JSON.stringify(card) })
      setCards((current) => [...current, saved])
      return saved
    },
    [request]
  )

  const removeCard = useCallback(
    async (id: string) => {
      await request(`/${id}`, { method: 'DELETE' })
      setCards((current) => current.filter((card) => card._id !== id))
    },
    [request]
  )

  const findCard = useCallback(
    (brand: CardBrand, last4: string) =>
      cards.find((card) => card.brand === brand && card.last4 === last4),
    [cards]
  )

  return { cards, loading, addCard, removeCard, findCard, refresh }
}