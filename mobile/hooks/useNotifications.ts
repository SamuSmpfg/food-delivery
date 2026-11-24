import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

const API_URL = process.env.EXPO_PUBLIC_API_URL

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function registerForPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Orders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7622',
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  const status =
    existing === 'granted' ? existing : (await Notifications.requestPermissionsAsync()).status
  if (status !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  if (!projectId) {
    console.warn('Sem projectId do EAS: rode `npx eas init`')
    return null
  }

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
  return data
}

export function usePushNotifications() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelled = false

    ;(async () => {
      try {
        const pushToken = await registerForPushToken()
        if (!pushToken || cancelled) return

        const token = await getTokenRef.current()
        await fetch(`${API_URL}/api/notifications/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ token: pushToken }),
        })
      } catch (error) {
        console.error('Error registering push token:', error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  const lastResponse = Notifications.useLastNotificationResponse()
  useEffect(() => {
    if (!lastResponse) return
    if (lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return

    const type = lastResponse.notification.request.content.data?.type
    if (type === 'order_new' || type === 'order_cancelled') {
      router.navigate('/(chef)/(tabs)/(home)' as any)
    }
  }, [lastResponse])
}