import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { Redirect, Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useRole } from '../../../hooks/useRole'
import { useAutoSelectAddress } from '@/lib/useAutoSelectAddress'

export default function ChefLayout() {
  const { role, isLoaded } = useRole()

  useAutoSelectAddress(isLoaded && role === 'chef')

  if (!isLoaded) return null
  if (role !== 'chef') return <Redirect href="/(tabs)/HomeScreen" />

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="Chat" />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}