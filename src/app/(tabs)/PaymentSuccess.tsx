import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import useBackHandler from '../../../hooks/useBackHandler'

const PaymentSuccess = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { method, total } = useLocalSearchParams<{ method: string; total: string }>()

  const isCash = method === 'Cash'

  useBackHandler(() => {})

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.center}>
        <View style={styles.checkCircle}>
          <Feather name="check" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>Order placed!</Text>
        <Text style={styles.text}>
          {isCash
            ? `Pay $${total} in cash when your order arrives.`
            : `You successfully maked a payment, enjoy our service!`}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.replace({
            pathname: '/(tabs)/TrackingOrder',
            params: { from: 'payment' }
          })
        }
      >
        <Text style={styles.buttonText}>TRACK ORDER</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkCircle: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontFamily: 'Sen_700Bold',
    fontSize: 24,
    color: '#181C2E',
    marginTop: 32
  },
  text: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#646982',
    textAlign: 'center',
    marginTop: 12
  },
  button: {
    height: 62,
    borderRadius: 12,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: '#fff'
  }
})

export default PaymentSuccess