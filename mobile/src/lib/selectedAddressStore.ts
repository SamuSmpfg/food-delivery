import { useSyncExternalStore } from 'react'

let selectedId: string | null = null
const listeners = new Set<() => void>()

export const setSelectedAddressId = (id: string | null) => {
  selectedId = id
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useSelectedAddressId = () =>
  useSyncExternalStore(subscribe, () => selectedId, () => selectedId)