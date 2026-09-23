import React from 'react'
import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts, Sen_400Regular, Sen_700Bold, Sen_800ExtraBold } from '@expo-google-fonts/sen';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sen_400Regular,
    Sen_700Bold,
    Sen_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}