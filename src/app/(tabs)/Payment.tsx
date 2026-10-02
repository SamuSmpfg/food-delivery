import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
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
    title: 'No Visa card added',
    text: 'Add a Visa card to pay for this order'
  },
  mastercard: {
    title: 'No Mastercard added',
    text: 'Add a Mastercard to pay for this order'
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
      <View style={styles.mastercardLogo}>
        <View style={[styles.mastercardCircle, styles.mastercardRed]} />
        <View style={[styles.mastercardCircle, styles.mastercardOrange]} />
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
    return <MaterialCommunityIcons name="cash-multiple" size={48} color="#FF7622" />
  }
  if (method === 'paypal') {
    return <FontAwesome name="paypal" size={44} color="#179BD7" />
  }
  return <MaterialCommunityIcons name="credit-card-outline" size={48} color="#FF7622" />
}

const Payment = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { total, clear } = useCart()

  const [method, setMethod] = useState<Method>('mastercard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isCard = method === 'visa' || method === 'mastercard'
  const panel = PANELS[method]
  const methodLabel = METHODS.find((item) => item.id === method)?.label ?? ''

  const finish = (label: string) => {
    const paid = total
    router.replace({
      pathname: '/(tabs)/PaymentSuccess',
      params: { method: label, total: String(paid) }
    })
    clear()
  }

  const goToAddCard = () => {
    router.navigate({ pathname: '/(tabs)/AddCard', params: { brand: method } })
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
        finish('PayPal')
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
      finish('Cash')
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
            <Text style={styles.confirmButtonText}>
              {isCard ? `ADD ${methodLabel.toUpperCase()} CARD` : 'PAY & CONFIRM'}
            </Text>
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
    gap: 16
  },
  methodItem: {
    alignItems: 'center',
    gap: 8
  },
  methodTile: {
    width: 90,
    height: 80,
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
    top: -8,
    right: -8,
    width: 22,
    height: 22,
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
    color: '#1A1F71'
  },
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mastercardCircle: {
    width: 26,
    height: 26,
    borderRadius: 100
  },
  mastercardRed: {
    backgroundColor: '#EB001B'
  },
  mastercardOrange: {
    backgroundColor: '#F79E1B',
    marginLeft: -10
  },
  paypalLogo: {
    fontFamily: 'Sen_700Bold',
    fontStyle: 'italic',
    fontSize: 20
  },
  paypalDark: {
    color: '#253B80'
  },
  paypalLight: {
    color: '#179BD7'
  },
  panel: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#F6F8FA',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  panelIcon: {
    width: 96,
    height: 96,
    borderRadius: 100,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  panelTitle: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#181C2E',
    marginTop: 20
  },
  panelText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 24,
    color: '#7E8A97',
    textAlign: 'center',
    marginTop: 8
  },
  addNew: {
    height: 62,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F0F5FA',
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