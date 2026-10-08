import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { CardField, useStripe } from '@stripe/stripe-react-native'
import Feather from '@expo/vector-icons/Feather'
import { useCart } from '../../context/CartContext'
import { postJson } from '../../lib/api'

const AddCard = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { brand } = useLocalSearchParams<{ brand: string }>()
  const { confirmPayment } = useStripe()
  const { total, clear } = useCart()

  const [holder, setHolder] = useState('')
  const [cardComplete, setCardComplete] = useState(false)
  const [cardBrand, setCardBrand] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const brandLabel = brand === 'visa' ? 'Visa' : brand === 'mastercard' ? 'Mastercard' : 'card'
  const canSubmit = holder.trim().length > 1 && cardComplete && !loading && total > 0

  const handlePay = async () => {
    const detected = cardBrand.toLowerCase()

    if (
      (brand === 'visa' || brand === 'mastercard') &&
      detected &&
      detected !== 'unknown' &&
      detected !== brand
    ) {
      setError(`This is not a ${brandLabel} card`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { clientSecret } = await postJson<{ clientSecret: string }>(
        '/api/payments/stripe/intent',
        { amount: total }
      )

      const { error: stripeError } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails: { name: holder.trim() } }
      })

      if (stripeError) {
        setError(stripeError.message)
        return
      }

      const paid = total
      router.replace({
        pathname: '/(tabs)/PaymentSuccess',
        params: { method: brandLabel === 'card' ? 'Card' : brandLabel, total: String(paid) }
      })
      clear()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={20} color="#181C2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Card</Text>
        </View>

        <Text style={styles.label}>CARD HOLDER NAME</Text>
        <TextInput
          style={styles.input}
          value={holder}
          onChangeText={(text) => {
            setHolder(text)
            setError('')
          }}
          placeholder="Name on the card"
          placeholderTextColor="#A0A5BA"
          autoCapitalize="words"
        />

        <Text style={styles.label}>CARD NUMBER</Text>
        <View style={styles.cardBox}>
          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: '---- ---- ---- ----', expiration: 'mm/yy', cvc: '***' }}
            cardStyle={{
              backgroundColor: '#F0F5FA',
              textColor: '#181C2E',
              placeholderColor: '#A0A5BA',
              fontSize: 16
            }}
            style={styles.cardField}
            onCardChange={(details) => {
              setCardComplete(details.complete)
              setCardBrand(details.brand ?? '')
              setError('')
            }}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.payButton, !canSubmit && styles.payButtonDisabled]}
          disabled={!canSubmit}
          onPress={handlePay}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>ADD & MAKE PAYMENT</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  closeButton: {
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
  label: {
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    color: '#A0A5BA',
    marginTop: 32,
    marginBottom: 12
  },
  input: {
    height: 62,
    borderRadius: 10,
    backgroundColor: '#F0F5FA',
    paddingHorizontal: 20,
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#181C2E'
  },
  cardBox: {
    height: 62,
    borderRadius: 10,
    backgroundColor: '#F0F5FA',
    paddingHorizontal: 12,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  cardField: {
    width: '100%',
    height: 50
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
  payButton: {
    height: 62,
    borderRadius: 12,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center'
  },
  payButtonDisabled: {
    opacity: 0.5
  },
  payButtonText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: '#fff'
  }
})

export default AddCard