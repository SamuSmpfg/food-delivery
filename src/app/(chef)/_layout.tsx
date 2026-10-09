import { Redirect, Stack } from 'expo-router'
import { useRole } from '../../../hooks/useRole'

export default function ChefLayout() {
  const { role, isLoaded } = useRole()

  if (!isLoaded) return null
  if (role !== 'chef') return <Redirect href="/(tabs)/HomeScreen" />

  return <Stack screenOptions={{ headerShown: false }} />
}   