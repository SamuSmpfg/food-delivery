import { useSyncExternalStore } from 'react'

export type CardBrand = 'visa' | 'mastercard'

export type SavedCard = {
  id: string
  brand: CardBrand
  holder: string
  last4: string
}

let cards: SavedCard[] = []
const listeners = new Set<() => void>()

const emit = () => {
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => cards

export const findSavedCard = (brand: CardBrand, last4: string) =>
  cards.find((card) => card.brand === brand && card.last4 === last4)

export const addSavedCard = (card: Omit<SavedCard, 'id'>): SavedCard | null => {
  if (findSavedCard(card.brand, card.last4)) return null

  const saved: SavedCard = { ...card, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
  cards = [...cards, saved]
  emit()
  return saved
}


export const useSavedCards = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot)