import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Feather from '@expo/vector-icons/Feather'
import { useCart } from '../../context/CartContext'
import { postJson } from '../../lib/api'
import useCreateOrder from '../../../hooks/useCreateOrder'

type Method = 'cash' | 'visa' | 'mastercard' | 'paypal'

const METHODS: { id: Method; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'paypal', label: 'Paypal' }
]

const PANELS: Record<Method, { title: string; text: string }> = {
  cash: {
    title: 'Pay with cash',
    text: 'Have the exact amount ready when your order arrives'
  },
  visa: {
    title: 'No visa card added',
    text: 'You can add a visa card and save it for later'
  },
  mastercard: {
    title: 'No master card added',
    text: 'You can add a mastercard and save it for later'
  },
  paypal: {
    title: 'Pay with PayPal',
    text: "You'll be taken to PayPal to approve the payment"
  }
}

const MethodLogo = ({ method }: { method: Method }) => {
  if (method === 'cash') {
    return <MaterialCommunityIcons name="hand-coin-outline" size={30} color="#FF7622" />
  }
  if (method === 'visa') {
    return <Text style={styles.visaLogo}>VISA</Text>
  }
  if (method === 'mastercard') {
    return (
      <View style={styles.mastercardWrapper}>
        <View style={styles.mastercardLogo}>
          <View style={[styles.mastercardCircle, styles.mastercardRed]} />
          <View style={[styles.mastercardCircle, styles.mastercardOrange]} />
        </View>
        <Text style={styles.mastercardText}>mastercard</Text>
      </View>
    )
  }
  return (
    <Text style={styles.paypalLogo}>
      <Text style={styles.paypalDark}>Pay</Text>
      <Text style={styles.paypalLight}>Pal</Text>
    </Text>
  )
}

const PanelIcon = ({ method }: { method: Method }) => {
  if (method === 'cash') {
    return <MaterialCommunityIcons name="cash-multiple" size={64} color="#FF7622" />
  }
  if (method === 'paypal') {
    return <FontAwesome name="paypal" size={56} color="#179BD7" />
  }
  if (method === 'visa') {
    return <Text style={styles.panelVisaLogo}>VISA</Text>
  }
  return (
    <Image
      source={require('../../../assets/images/card.png')}
      style={styles.cardImage}
      resizeMode="contain"
    />
  )
}

const Payment = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { items, count, total, placeOrder } = useCart()
  const { createOrder } = useCreateOrder()

  const [method, setMethod] = useState<Method>('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isCard = method === 'visa' || method === 'mastercard'
  const panel = PANELS[method]

  const finish = async (label: string) => {
    const paid = total
    const restaurantName = items.find((item) => item.restaurant)?.restaurant || 'Restaurant'

    await createOrder({
      restaurantName,
      total: Math.round(paid * 100) / 100,
      itemsCount: count
    })

    placeOrder()
    router.replace({
      pathname: '/(tabs)/PaymentSuccess',
      params: { method: label, total: String(paid) }
    })
  }

  const goToAddCard = () => {
    router.navigate({ pathname: '/(tabs)/AddCard', params: { brand: method } })
  }

  const payWithCash = async () => {
    setLoading(true)
    setError('')

    try {
      await finish('Cash')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const payWithPayPal = async () => {
    setLoading(true)
    setError('')

    try {
      const order = await postJson<{ id: string; approveUrl: string }>(
        '/api/payments/paypal/order',
        { amount: total }
      )

      await WebBrowser.openBrowserAsync(order.approveUrl)

      const result = await postJson<{ status: string }>('/api/payments/paypal/capture', {
        orderId: order.id
      })

      if (result.status === 'COMPLETED') {
        await finish('PayPal')
      } else {
        setError('The PayPal payment was not completed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (method === 'cash') {
      payWithCash()
      return
    }
    if (method === 'paypal') {
      payWithPayPal()
      return
    }
    goToAddCard()
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.methodsScroll}
          contentContainerStyle={styles.methodsList}
        >
          {METHODS.map((item) => {
            const selected = item.id === method
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.methodItem}
                onPress={() => {
                  setMethod(item.id)
                  setError('')
                }}
              >
                <View style={[styles.methodTile, selected && styles.methodTileSelected]}>
                  <MethodLogo method={item.id} />
                  {selected && (
                    <View style={styles.checkBadge}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={styles.methodLabel}>{item.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <View style={styles.panel}>
          <View style={styles.panelIcon}>
            <PanelIcon method={method} />
          </View>
          <Text style={styles.panelTitle}>{panel.title}</Text>
          <Text style={styles.panelText}>{panel.text}</Text>
        </View>

        {isCard && (
          <TouchableOpacity style={styles.addNew} onPress={goToAddCard}>
            <Feather name="plus" size={20} color="#FF7622" />
            <Text style={styles.addNewText}>ADD NEW</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalValue}>${total}</Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, (loading || total === 0) && styles.confirmButtonDisabled]}
          disabled={loading || total === 0}
          onPress={handleConfirm}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>PAY & CONFIRM</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: '#ECF0F4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#181C2E'
  },
  methodsScroll: {
    flexGrow: 0,
    marginTop: 32,
    marginHorizontal: -24
  },
  methodsList: {
    paddingHorizontal: 24,
    paddingTop: 10,
    gap: 14
  },
  methodItem: {
    alignItems: 'center',
    gap: 8
  },
  methodTile: {
    width: 87,
    height: 72,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  methodTileSelected: {
    borderColor: '#FF7622',
    backgroundColor: '#fff'
  },
  checkBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center'
  },
  methodLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#464E57'
  },
  visaLogo: {
    fontFamily: 'Sen_700Bold',
    fontStyle: 'italic',
    fontSize: 22,
    color: '#3B5DA8'
  },
  panelVisaLogo: {
    fontFamily: 'Sen_700Bold',
    fontStyle: 'italic',
    fontSize: 56,
    color: '#3B5DA8'
  },
  mastercardWrapper: {
    alignItems: 'center'
  },
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mastercardCircle: {
    width: 22,
    height: 22,
    borderRadius: 100
  },
  mastercardRed: {
    backgroundColor: '#EB001B'
  },
  mastercardOrange: {
    backgroundColor: '#F79E1B',
    marginLeft: -8
  },
  mastercardText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 7,
    color: '#181C2E',
    marginTop: 3
  },
  paypalLogo: {
    fontFamily: 'Sen_700Bold',
    fontStyle: 'italic',
    fontSize: 19
  },
  paypalDark: {
    color: '#253B80'
  },
  paypalLight: {
    color: '#179BD7'
  },
  panel: {
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: '#F6F8FA',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  panelIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardImage: {
    width: 350,
    height: 167
  },
  panelTitle: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#32343E',
    marginTop: 28
  },
  panelText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 15,
    lineHeight: 26,
    letterSpacing: 0.5,
    color: '#6B6E82',
    textAlign: 'center',
    marginTop: 8
  },
  addNew: {
    height: 62,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F0F5FA',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16
  },
  addNewText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    color: '#FF7622'
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16
  },
  errorText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#E04444',
    marginBottom: 12
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  totalLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#A0A5BA'
  },
  totalValue: {
    fontFamily: 'Sen_400Regular',
    fontSize: 30,
    color: '#181C2E'
  },
  confirmButton: {
    height: 62,
    borderRadius: 12,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24
  },
  confirmButtonDisabled: {
    opacity: 0.5
  },
  confirmButtonText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: '#fff'
  }
})

export default Payment