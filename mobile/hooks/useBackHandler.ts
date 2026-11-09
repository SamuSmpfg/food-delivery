import { useCallback } from 'react'
import { BackHandler } from 'react-native'
import { useFocusEffect } from 'expo-router'

const useBackHandler = (onBack: () => void) => {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onBack()
        return true
      })
      return () => subscription.remove()
    }, [onBack])
  )
}

export default useBackHandler