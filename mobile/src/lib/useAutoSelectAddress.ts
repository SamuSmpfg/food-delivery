import { useEffect, useRef } from 'react'
import * as Location from 'expo-location'
import { loadAddresses, saveAddress } from './addressStore'
import { setSelectedAddressId, useSelectedAddressId } from './selectedAddressStore'

const SAME_PLACE_METERS = 150

const toRadians = (value: number) => (value * Math.PI) / 180

const distanceInMeters = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const earthRadius = 6371000
  const dLat = toRadians(bLat - aLat)
  const dLng = toRadians(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

export const useAutoSelectAddress = (enabled: boolean) => {
  const selectedId = useSelectedAddressId()
  const startedRef = useRef(false)

  useEffect(() => {
    if (!enabled || startedRef.current || selectedId) return
    startedRef.current = true

    const run = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') return

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        const { latitude, longitude } = position.coords

        const saved = await loadAddresses()
        const nearby = saved.find(
          (item) =>
            distanceInMeters(latitude, longitude, item.latitude, item.longitude) <= SAME_PLACE_METERS
        )
        if (nearby) {
          setSelectedAddressId(nearby.id)
          return
        }

        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (!place) return

        const street = place.street ?? place.name ?? ''
        const streetWithNumber = [street, place.streetNumber].filter(Boolean).join(', ')
        const addressText = [streetWithNumber, place.district, place.city]
          .filter(Boolean)
          .join(' - ')
        if (!addressText) return

        await saveAddress({
          label: 'Other',
          address: addressText,
          street,
          postCode: place.postalCode ?? '',
          apartment: '',
          latitude,
          longitude,
        })

        const updated = await loadAddresses()
        const created = updated[updated.length - 1]
        if (created) setSelectedAddressId(created.id)
      } catch {}
    }

    run()
  }, [enabled, selectedId])
}