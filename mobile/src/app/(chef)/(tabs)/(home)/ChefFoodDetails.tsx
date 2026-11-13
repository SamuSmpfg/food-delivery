import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image,
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import AntDesign from '@expo/vector-icons/AntDesign'

type Props = {}

type Ingredient = {
  id: string
  name: string
  allergy?: boolean
}

type Food = {
  name: string
  price: string
  address: string
  description: string
  classification: string
  deliveryMode: string
  ingredients: Ingredient[]
}

type DishDto = {
  _id: string
  restaurantId?: { address?: string } | string
  name: string
  description: string
  image: string
  classification: string
  deliveryMode: string
  sizes: { label: string; price: number }[]
  ingredients: { name: string; kind: string }[]
  rating: number
  reviewsCount: number
}

const API_URL = process.env.EXPO_PUBLIC_API_URL

const CLASSIFICATIONS = ['Breakfast', 'Lunch', 'Dinner']
const DELIVERY_MODES = ['Delivery', 'Pickup', 'Dine-in']
const ALLERGY_KIND = 'allergy'
const DEFAULT_KIND = 'other'

const EMPTY_FOOD: Food = {
  name: '',
  price: '',
  address: '',
  description: '',
  classification: CLASSIFICATIONS[0],
  deliveryMode: DELIVERY_MODES[0],
  ingredients: [],
}

const toFood = (d: DishDto): Food => ({
  name: d.name ?? '',
  price: String(d.sizes?.[0]?.price ?? ''),
  address: typeof d.restaurantId === 'object' ? d.restaurantId?.address ?? '' : '',
  description: d.description ?? '',
  classification: d.classification ?? CLASSIFICATIONS[0],
  deliveryMode: d.deliveryMode ?? DELIVERY_MODES[0],
  ingredients: (d.ingredients ?? []).map((i, idx) => ({
    id: `${idx}-${i.name}`,
    name: i.name,
    allergy: i.kind === ALLERGY_KIND,
  })),
})

const toPayload = (changes: Partial<Food>, dish: DishDto) => {
  const payload: any = {}
  if (changes.name !== undefined) payload.name = changes.name
  if (changes.description !== undefined) payload.description = changes.description
  if (changes.classification !== undefined) payload.classification = changes.classification
  if (changes.deliveryMode !== undefined) payload.deliveryMode = changes.deliveryMode
  if (changes.price !== undefined) {
    const [first, ...rest] = dish.sizes?.length ? dish.sizes : [{ label: 'Único', price: 0 }]
    payload.sizes = [{ ...first, price: Number(changes.price) || 0 }, ...rest]
  }
  if (changes.ingredients !== undefined) {
    payload.ingredients = changes.ingredients.map((i) => ({
      name: i.name,
      kind: i.allergy ? ALLERGY_KIND : DEFAULT_KIND,
    }))
  }
  return payload
}

const getChanges = (base: Food, current: Food): Partial<Food> => {
  const changes: Partial<Food> = {}
  ;(Object.keys(current) as (keyof Food)[]).forEach((key) => {
    if (JSON.stringify(base[key]) !== JSON.stringify(current[key])) {
      ;(changes as any)[key] = current[key]
    }
  })
  return changes
}

const cycle = (list: string[], value: string) => list[(list.indexOf(value) + 1) % list.length]

const ChefFoodDetails = (props: Props) => {
  const router = useRouter()
  const navigation = useNavigation<any>()
  const { getToken } = useAuth()
  const { id: dishId } = useLocalSearchParams<{ id: string }>()

  const listRef = useRef<FlatList<Ingredient>>(null)

  const [loading, setLoading] = useState(true)
  const [dish, setDish] = useState<DishDto | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [food, setFood] = useState<Food>(EMPTY_FOOD)
  const [draft, setDraft] = useState<Food>(EMPTY_FOOD)
  const [newIngredient, setNewIngredient] = useState('')

  const foodRef = useRef(food)
  const draftRef = useRef(draft)
  const isEditingRef = useRef(isEditing)
  const dishRef = useRef<DishDto | null>(null)
  const loadedRef = useRef(false)
  const syncedRef = useRef<Food>(EMPTY_FOOD)
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())
  foodRef.current = food
  draftRef.current = draft
  isEditingRef.current = isEditing

  const data = isEditing ? draft : food

  useEffect(() => {
    if (!dishId) {
      setLoading(false)
      return
    }
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/api/dishes/${dishId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const d: DishDto = await res.json()
        if (!active) return
        const f = toFood(d)
        setDish(d)
        dishRef.current = d
        setFood(f)
        setDraft(f)
        syncedRef.current = f
        loadedRef.current = true
      } catch (e) {
        if (active) Alert.alert('Erro', 'Não foi possível carregar o prato.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [dishId])

  const doSync = async (current: Food) => {
    if (!dishId || !loadedRef.current || !dishRef.current) return
    const changes = getChanges(syncedRef.current, current)
    if (Object.keys(changes).length === 0) return

    const payload = toPayload(changes, dishRef.current)
    if (Object.keys(payload).length === 0) {
      syncedRef.current = current
      return
    }

    const token = await getToken()
    const res = await fetch(`${API_URL}/api/dishes/${dishId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const updated = await res.json().catch(() => null)
    if (updated?._id) {
      setDish(updated)
      dishRef.current = updated
    }
    syncedRef.current = current
  }

  const syncChanges = (current: Food) => {
    const run = queueRef.current.then(() => doSync(current))
    queueRef.current = run.catch(() => {})
    return run
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const current = isEditingRef.current ? draftRef.current : foodRef.current
      syncChanges(current).catch((e) => console.warn('Falha ao salvar prato:', e))
    })
    return unsubscribe
  }, [navigation, dishId])

  const handleEdit = () => {
    setDraft(food)
    setNewIngredient('')
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await syncChanges(draft)
      setFood(draft)
      setIsEditing(false)
    } catch (e) {
      Alert.alert('Erro ao salvar', 'Não foi possível salvar as alterações. Tente novamente.')
    }
  }

  const handleCancel = () => {
    setDraft(food)
    setNewIngredient('')
    setIsEditing(false)
  }

  const confirmSave = () => {
    Alert.alert('Save changes', 'Are you sure you want to save the changes?', [
      { text: 'No, cancel', style: 'cancel' },
      { text: 'Yes, save', onPress: () => handleSave() },
    ])
  }

  const updateField = <K extends keyof Food>(key: K, value: Food[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const toggleAllergy = (id: string) => {
    if (!isEditing) return
    updateField(
      'ingredients',
      draft.ingredients.map((i) => (i.id === id ? { ...i, allergy: !i.allergy } : i))
    )
  }

  const removeIngredient = (id: string) =>
    updateField('ingredients', draft.ingredients.filter((i) => i.id !== id))

  const addIngredient = () => {
    const name = newIngredient.trim()
    if (!name) return
    updateField('ingredients', [...draft.ingredients, { id: String(Date.now()), name }])
    setNewIngredient('')
  }

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <TouchableOpacity
      style={styles.ingredientItem}
      activeOpacity={isEditing ? 0.6 : 1}
      onPress={() => toggleAllergy(item.id)}
    >
      <View style={[styles.ingredientCircle, isEditing && item.allergy && styles.ingredientCircleAllergy]}>
        <Text style={styles.ingredientCircleText} numberOfLines={1} adjustsFontSizeToFit>
          {item.name}
        </Text>
      </View>

      {isEditing && (
        <TouchableOpacity style={styles.removeBadge} onPress={() => removeIngredient(item.id)}>
          <MaterialIcons name="close" size={12} color="#fff" />
        </TouchableOpacity>
      )}

      {item.allergy && <Text style={styles.ingredientAllergy}>(Allergy)</Text>}
    </TouchableOpacity>
  )

  const renderListHeader = () => (
    <View>
      <View style={styles.foodImg}>
        {!!dish?.image && (
          <Image
            source={{ uri: dish.image }}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            resizeMode="cover"
          />
        )}
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.foodClass, styles.foodClassEditing]}
              onPress={() => updateField('classification', cycle(CLASSIFICATIONS, data.classification))}
            >
              <Text style={styles.foodClassText}>{data.classification}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.foodClass, styles.foodClassEditing]}
              onPress={() => updateField('deliveryMode', cycle(DELIVERY_MODES, data.deliveryMode))}
            >
              <Text style={styles.foodClassText}>{data.deliveryMode}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.foodClass}>
              <Text style={styles.foodClassText}>{data.classification}</Text>
            </View>
            <View style={styles.foodClass}>
              <Text style={styles.foodClassText}>{data.deliveryMode}</Text>
            </View>
          </>
        )}
      </View>

      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          {isEditing ? (
            <TextInput
              style={[styles.foodNameAndPrice, styles.input, { flex: 1, marginRight: 12 }]}
              value={data.name}
              onChangeText={(t) => updateField('name', t)}
              placeholder="Food name"
              placeholderTextColor={'#9C9BA6'}
            />
          ) : (
            <Text style={styles.foodNameAndPrice}>{data.name}</Text>
          )}

          {isEditing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.foodNameAndPrice}>$</Text>
              <TextInput
                style={[styles.foodNameAndPrice, styles.input, { minWidth: 48, textAlign: 'right' }]}
                value={data.price}
                onChangeText={(t) => updateField('price', t.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={'#9C9BA6'}
              />
            </View>
          ) : (
            <Text style={styles.foodNameAndPrice}>${data.price}</Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
          <FontAwesome6 name="location-dot" size={16} color="#AFAFAF" />
          <Text style={styles.addressAndReviews}>{data.address}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
            <AntDesign name="star" size={24} color="#FB6D3A" />
            <Text style={styles.rating}>{dish?.rating ? dish.rating.toFixed(1) : '-'}</Text>
            <Text style={styles.addressAndReviews}>({dish?.reviewsCount ?? 0} reviews)</Text>
          </View>
        </View>
      </View>

      <View style={styles.lineSeparator} />

      <Text style={styles.ingredientsTitle}>INGREDIENTS</Text>

      {isEditing && (
        <View style={styles.addIngredientRow}>
          <TextInput
            style={[styles.addIngredientInput, styles.input]}
            value={newIngredient}
            onChangeText={setNewIngredient}
            placeholder="New ingredient"
            placeholderTextColor="#AFAFAF"
            onSubmitEditing={addIngredient}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredient}>
            <MaterialIcons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      {isEditing && <Text style={styles.hintText}>Tap an ingredient to mark/unmark an allergy</Text>}
    </View>
  )

  const renderListFooter = () => (
    <View style={styles.footer}>
      <View style={styles.lineSeparator} />

      <Text style={styles.ingredientsTitle}>DESCRIPTION</Text>
      {isEditing ? (
        <TextInput
          style={[styles.descriptionText, styles.input, styles.descriptionInput]}
          value={data.description}
          onChangeText={(t) => updateField('description', t)}
          onFocus={() => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 250)}
          multiline
          textAlignVertical="top"
          placeholder="Description"
        />
      ) : (
        <Text style={styles.descriptionText}>{data.description}</Text>
      )}
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#FB6D3A" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackTouchableOpacity}>
          <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
        </TouchableOpacity>

        <Text style={styles.title}>Food Details</Text>

        {isEditing && (
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelTouchableOpacity}>CANCEL</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={isEditing ? confirmSave : handleEdit}>
          <Text style={styles.editTouchableOpacity}>{isEditing ? 'SAVE' : 'EDIT'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={listRef}
          data={data.ingredients}
          extraData={isEditing}
          keyExtractor={(item) => item.id}
          renderItem={renderIngredient}
          numColumns={5}
          ListHeaderComponent={renderListHeader()}
          ListFooterComponent={renderListFooter()}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.ingredientsList, isEditing && styles.ingredientsListEditing]}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    marginRight: 'auto',
  },
  editTouchableOpacity: {
    color: '#FB6D3A',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
  },
  cancelTouchableOpacity: {
    color: '#AFAFAF',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    marginRight: 12,
  },
  foodImg: {
    width: 'auto',
    height: 230,
    borderRadius: 20,
    backgroundColor: '#98A8B8',
    marginTop: 32,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  foodClass: {
    backgroundColor: '#FFFFFFCC',
    width: 'auto',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodClassText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#32343E',
  },
  addressAndReviews: {
    color: '#AFAFAF',
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    marginLeft: 8,
  },
  rating: {
    color: '#FB6D3A',
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    marginLeft: 8,
  },
  foodNameAndPrice: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#32343E',
  },
  lineSeparator: {
    width: 'auto',
    backgroundColor: '#F0F4F9',
    height: 1,
    marginVertical: 24,
  },
  ingredientsTitle: {
    color: '#32343E',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    marginBottom: 16,
  },
  ingredientsList: {
    rowGap: 16,
    paddingBottom: 120,
  },
  ingredientsListEditing: {
    paddingBottom: 320,
  },
  ingredientItem: {
    width: '20%',
    alignItems: 'center',
  },
  ingredientCircle: {
    width: '88%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#FDEBE4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  ingredientCircleText: {
    color: '#FF7622',
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  ingredientAllergy: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 9,
    marginTop: 4,
  },
  footer: {
    width: '100%',
  },
  descriptionText: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#FB6D3A',
    paddingVertical: 2,
  },
  descriptionInput: {
    minHeight: 100,
  },
  addIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addIngredientInput: {
    flex: 1,
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#32343E',
  },
  addIngredientButton: {
    backgroundColor: '#FB6D3A',
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: '#AFAFAF',
    fontFamily: 'Sen_400Regular',
    fontSize: 11,
    marginBottom: 16,
  },
  ingredientCircleAllergy: {
    borderWidth: 1,
    borderColor: '#FB6D3A',
  },
  removeBadge: {
    position: 'absolute',
    top: -4,
    right: 2,
    backgroundColor: '#FB6D3A',
    height: 18,
    width: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodClassEditing: {
    borderWidth: 1,
    borderColor: '#FB6D3A',
  },
})

export default ChefFoodDetails