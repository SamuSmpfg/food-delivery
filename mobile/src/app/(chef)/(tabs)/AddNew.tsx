import { View, Text, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import ImageUploadList from '@/components/ImageUploadList'
import IngredientList from '@/components/IngredientList'

type Props = {}

type DeliveryOption = 'pickup' | 'delivery'

type CheckItemProps = {
  label: string
  checked: boolean
  onPress: () => void
}

const CheckItem = ({ label, checked, onPress }: CheckItemProps) => (
  <TouchableOpacity style={styles.checkItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <MaterialIcons name="check" size={16} color="#FF7622" />}
    </View>
    <Text style={styles.checkboxlabel}>{label}</Text>
  </TouchableOpacity>
)

const AddNew = (props: Props) => {

  const router = useRouter()
  const [itemName, setItemName] = useState('')
  const [price, setPrice] = useState('')
  const [details, setDetails] = useState('')
  const [option, setOption] = useState<DeliveryOption>('pickup')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [resetKey, setResetKey] = useState(0)

  const toggleIngredient = (id: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const resetForm = () => {
    setItemName('')
    setPrice('')
    setDetails('')
    setOption('pickup')
    setSelectedIngredients([])
    setResetKey((prev) => prev + 1)
    Keyboard.dismiss()
  }

  const handleReset = () => {
    Alert.alert(
      'Reset Formulary',
      'Are you sure you want to reset? All entered information will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetForm },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackTouchableOpacity}>
          <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
        </TouchableOpacity>

        <Text style={styles.title}>Add New Items</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.reset}>RESET</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginVertical: 16, paddingHorizontal:24 }}>
        <Text style={styles.labels}>ITEM NAME</Text>
        <TextInput
          style={styles.itemNameInput}
          placeholder='Mazalichiken Halim'
          placeholderTextColor={'#9C9BA6'}
          value={itemName}
          onChangeText={setItemName}
        />
      </View>

      <View style={{ marginVertical: 16, paddingHorizontal: 24 }}>
        <Text style={styles.labels}>UPLOAD PHOTO/VIDEO</Text>
        <View style={{ marginHorizontal: -24 }}>
          <ImageUploadList key={`images-${resetKey}`} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ marginTop: 16 }}>
            <Text style={styles.labels}>PRICE</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder='$50'
                placeholderTextColor={'#9C9BA6'}
                keyboardType='numeric'
                value={price}
                onChangeText={setPrice}
              />
              <View style={styles.checkboxWrapper}>
                <CheckItem label="Pick up" checked={option === 'pickup'} onPress={() => setOption('pickup')} />
                <CheckItem label="Delivery" checked={option === 'delivery'} onPress={() => setOption('delivery')} />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.labels}>INGREDIENTS</Text>
          <View style={{ marginHorizontal: -24 }}>
            <IngredientList
              key={`ingredients-${resetKey}`}
              selectedIds={selectedIngredients}
              onToggle={toggleIngredient}
            />
          </View>
        </View>

        <View>
          <Text style={[styles.labels, {marginTop: 32}]}>DETAILS</Text>
          <TextInput 
          style={styles.detailsTextInput}
          placeholder='Write down the food Details.'
          placeholderTextColor={'#6B6E82'}
          inputMode="text"
          multiline
          textAlignVertical="top"
          value={details}
          onChangeText={setDetails}
          />
        </View>

        <TouchableOpacity style={styles.saveTouchableOpacity}>
          <Text style={styles.saveText}>SAVE CHANGES</Text>
        </TouchableOpacity>

      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  goBackTouchableOpacity: {
    backgroundColor: '#ECF0F4',
    height: 45,
    width: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#32343E',
    marginLeft: 16,
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    marginRight: 'auto'
  },
  reset: {
    color: '#FB6D3A',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
  },
  itemNameInput: {
    backgroundColor: '#FDFDFD',
    borderWidth: 1,
    borderColor: '#E8EAED',
    paddingLeft: 16,
    borderRadius: 12,
    marginVertical: 16,
    width: 'auto',
    height: 60,
    fontFamily: 'Sen_400Regular',
    fontSize: 14
  },
  labels: {
    color: '#32343E',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  priceInput: {
    width: 115,
    height: 42,
    backgroundColor: '#FDFDFD',
    borderWidth: 1,
    borderColor: '#E8EAED',
    paddingLeft: 16,
    borderRadius: 12,
    fontFamily: 'Sen_400Regular',
    fontSize: 14
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    gap: 20
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E8EAED',
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: {
    borderColor: '#FF7622'
  },
  checkboxlabel: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: 'Sen_400Regular',
    color: '#7E8A97'
  },
  detailsTextInput: {
    width: 'auto',
    height: 130,
    borderWidth: 1,
    borderColor: '#E8EAED',
    backgroundColor: '#FDFDFD',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    borderRadius: 12,
    marginTop: 16,
    paddingLeft: 16,
    paddingTop: 16
  },
  saveTouchableOpacity: {
    width: 'auto',
    height: 70,
    backgroundColor: '#FF7622',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 64
  },
  saveText: {
    color: '#fff',
    fontFamily: 'Sen_400Regular',
    fontSize: 16
  }
})

export default AddNew