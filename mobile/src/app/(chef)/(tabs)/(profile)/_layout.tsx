import { Stack } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'Profile',
}

export default function ProfileStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}