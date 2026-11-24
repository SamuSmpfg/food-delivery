import { Redirect, Stack } from 'expo-router'
import { StripeProvider } from '@stripe/stripe-react-native'
import { CartProvider } from '../../context/CartContext'
import { useRole } from '../../../hooks/useRole'
import { useAutoSelectAddress } from '@/lib/useAutoSelectAddress'

export const unstable_settings = {
  initialRouteName: 'HomeScreen'
}

const TabsLayout = () => {
  const { role, isLoaded } = useRole()

  useAutoSelectAddress(isLoaded && role !== 'chef')

  if (!isLoaded) return null
  if (role === 'chef') return <Redirect href="/(chef)/(tabs)/(home)" />

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="HomeScreen" />
          <Stack.Screen name="Search" />
          <Stack.Screen name="RestaurantView" />
          <Stack.Screen name="FoodDetails" />
          <Stack.Screen name="Cart" />
          <Stack.Screen name="Payment" />
          <Stack.Screen name="AddCard" />
          <Stack.Screen name="PaymentSuccess" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="TrackingOrder"
            options={({ route }) => ({
              gestureEnabled:
                (route.params as { from?: string } | undefined)?.from === 'orders'
            })}
          />
          <Stack.Screen name="WriteReview" />
        </Stack>
      </CartProvider>
    </StripeProvider>
  )
}

export default TabsLayout