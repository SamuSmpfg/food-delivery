import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Feather from '@expo/vector-icons/Feather'
import { useCart } from '../../context/CartContext'

const Cart = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { items, total, address, setAddress, changeQuantity, removeItem } = useCart()

  const [editing, setEditing] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressDraft, setAddressDraft] = useState('')

  const startEditingAddress = () => {
    setAddressDraft(address)
    setEditingAddress(true)
  }

  const saveAddress = () => {
    setAddress(addressDraft.trim())
    setEditingAddress(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="keyboard-arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => setEditing((current) => !current)}>
            <Text style={[styles.headerAction, editing && styles.headerActionDone]}>
              {editing ? 'DONE' : 'EDIT ITEMS'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {items.length === 0 && <Text style={styles.emptyText}>Your cart is empty</Text>}

        {items.map((item) => (
          <View key={item.key} style={styles.itemRow}>
            <View style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <View style={styles.itemTop}>
                <Text style={styles.itemName}>{item.name}</Text>
                {editing && (
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.key)}>
                    <Feather name="x" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.itemPrice}>${item.unitPrice * item.quantity}</Text>
              <View style={styles.itemBottom}>
                <Text style={styles.itemSize}>{item.size}</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() => changeQuantity(item.key, -1)}
                  >
                    <Feather name="minus" size={12} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() => changeQuantity(item.key, 1)}
                  >
                    <Feather name="plus" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>DELIVERY ADDRESS</Text>
          <TouchableOpacity onPress={editingAddress ? saveAddress : startEditingAddress}>
            <Text style={styles.linkText}>{editingAddress ? 'SAVE' : 'EDIT'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressBox}>
          {editingAddress ? (
            <TextInput
              style={styles.addressInput}
              value={addressDraft}
              onChangeText={setAddressDraft}
              placeholder="Type your delivery address"
              placeholderTextColor="#A0A5BA"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveAddress}
            />
          ) : (
            <Text
              numberOfLines={2}
              style={[styles.addressText, !address && styles.addressPlaceholder]}
            >
              {address || 'Add your delivery address'}
            </Text>
          )}
        </View>

        <View style={[styles.sheetRow, styles.totalRow]}>
          <View style={styles.totalLeft}>
            <Text style={styles.sheetLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>${total}</Text>
          </View>
          <TouchableOpacity style={styles.breakdown}>
            <Text style={styles.breakdownText}>Breakdown</Text>
            <MaterialIcons name="keyboard-arrow-right" size={18} color="#181C2E" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.orderButton,
            (items.length === 0 || !address) && styles.orderButtonDisabled
          ]}
          disabled={items.length === 0 || !address}
          onPress={() => router.navigate('/(tabs)/Payment')}
        >
          <Text style={styles.orderButtonText}>PLACE ORDER</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121223'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: '#2B2B3C',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#fff'
  },
  headerAction: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#FF7622',
    textDecorationLine: 'underline'
  },
  headerActionDone: {
    color: '#32AE5B',
    textDecorationLine: 'none'
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24
  },
  emptyText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#A0A5BA',
    textAlign: 'center',
    marginTop: 80
  },
  itemRow: {
    flexDirection: 'row',
    gap: 20
  },
  itemImage: {
    width: 136,
    height: 117,
    borderRadius: 25,
    backgroundColor: '#2B2B3C'
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between'
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8
  },
  itemName: {
    flex: 1,
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
    color: '#fff'
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: '#E04444',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemPrice: {
    fontFamily: 'Sen_700Bold',
    fontSize: 20,
    color: '#fff'
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemSize: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#A0A5BA'
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  stepperButton: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: '#2B2B3C',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperValue: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#fff'
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sheetLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#A0A5BA'
  },
  linkText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#FF7622',
    textDecorationLine: 'underline'
  },
  addressBox: {
    minHeight: 62,
    borderRadius: 10,
    backgroundColor: '#F0F5FA',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12
  },
  addressText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#6B6E82'
  },
  addressPlaceholder: {
    color: '#A0A5BA'
  },
  addressInput: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#181C2E',
    padding: 0
  },
  totalRow: {
    marginTop: 24
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  totalValue: {
    fontFamily: 'Sen_400Regular',
    fontSize: 30,
    color: '#181C2E'
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  breakdownText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#FF7622'
  },
  orderButton: {
    height: 62,
    borderRadius: 12,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24
  },
  orderButtonDisabled: {
    opacity: 0.5
  },
  orderButtonText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: '#fff'
  }
})

export default Cart