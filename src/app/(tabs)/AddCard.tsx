import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { useCart } from '../../context/CartContext'
import { addSavedCard, CardBrand } from '../../lib/cards'
import useCreateOrder from '../../../hooks/useCreateOrder'

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const AddCard = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { brand } = useLocalSearchParams<{ brand: string }>()
  const { items, count, total, placeOrder } = useCart()
  const { createOrder } = useCreateOrder()

  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cardBrand: CardBrand = brand === 'visa' ? 'visa' : 'mastercard'
  const brandLabel = cardBrand === 'visa' ? 'Visa' : 'Mastercard'

  const digitsOnly = number.replace(/\D/g, '')
  const canSubmit = holder.trim().length > 0 && digitsOnly.length > 0 && !loading && total > 0

  const handlePay = async () => {
    setLoading(true)
    setError('')

    try {
      const paid = total
      const restaurantName = items.find((item) => item.restaurant)?.restaurant || 'Restaurant'

      addSavedCard({
        brand: cardBrand,
        holder: holder.trim(),
        last4: digitsOnly.slice(-4)
      })

      await createOrder({
        restaurantName,
        total: Math.round(paid * 100) / 100,
        itemsCount: count
      })

      placeOrder()
      router.replace({
        pathname: '/(tabs)/PaymentSuccess',
        params: { method: brandLabel, total: String(paid) }
      })
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
        <TextInput
          style={styles.input}
          value={number}
          onChangeText={(text) => {
            setNumber(formatCardNumber(text))
            setError('')
          }}
          placeholder="---- ---- ---- ----"
          placeholderTextColor="#A0A5BA"
          keyboardType="number-pad"
          maxLength={19}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>EXPIRE DATE</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={(text) => setExpiry(formatExpiry(text))}
              placeholder="mm/yyyy"
              placeholderTextColor="#A0A5BA"
              keyboardType="number-pad"
              maxLength={7}
            />
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>CVC</Text>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={(text) => setCvc(text.replace(/\D/g, '').slice(0, 4))}
              placeholder="***"
              placeholderTextColor="#A0A5BA"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
          </View>
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
  row: {
    flexDirection: 'row',
    gap: 16
  },
  rowItem: {
    flex: 1
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