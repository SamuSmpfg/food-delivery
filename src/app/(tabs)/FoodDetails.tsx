import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { FOODS, RESTAURANTS } from '../../data/mockData'
import { useCart } from '../../context/CartContext'

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

const SIZES = [10, 14, 16]

const INGREDIENTS: { id: string; icon: IconName }[] = [
  { id: '1', icon: 'shaker-outline' },
  { id: '2', icon: 'food-drumstick-outline' },
  { id: '3', icon: 'leaf' },
  { id: '4', icon: 'fish' },
  { id: '5', icon: 'chili-mild-outline' },
]

const FoodDetails = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { addItem } = useCart()

  const [favorite, setFavorite] = useState(false)
  const [size, setSize] = useState(14)
  const [quantity, setQuantity] = useState(1)

  const food = FOODS.find((item) => item.id === id)
  const restaurant = food
    ? RESTAURANTS.find((item) => item.id === food.restaurantId)
    : undefined

  if (!food) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
          <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.notFoundText}>Dish not found</Text>
      </View>
    )
  }

  const total = food.price * quantity

  const handleAddToCart = () => {
    addItem({
      id: food.id,
      name: food.name,
      restaurant: food.restaurant,
      price: food.price,
      size: `${size}"`,
      quantity
    })
    router.navigate('/(tabs)/Cart')
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <View style={[styles.heroButtons, { top: insets.top + 16 }]}>
            <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
              <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => setFavorite((current) => !current)}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color="#FF7622"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.foodName}>{food.name}</Text>

          <View style={styles.restaurantRow}>
            <View style={styles.restaurantAvatar} />
            <Text style={styles.restaurantName}>{food.restaurant}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <FontAwesome6 name="star" size={18} color="#FF7622" />
              <Text style={styles.infoBold}>{restaurant?.rating ?? '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="truck" size={18} color="#FF7622" />
              <Text style={styles.infoText}>{restaurant?.delivery ?? '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="clock" size={18} color="#FF7622" />
              <Text style={styles.infoText}>{restaurant?.time ?? '-'}</Text>
            </View>
          </View>

          <Text style={styles.description}>{food.description}</Text>

          <View style={styles.sizeRow}>
            <Text style={styles.sizeLabel}>SIZE:</Text>
            {SIZES.map((option) => {
              const selected = option === size
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.sizeChip, selected && styles.sizeChipSelected]}
                  onPress={() => setSize(option)}
                >
                  <Text style={[styles.sizeChipText, selected && styles.sizeChipTextSelected]}>
                    {option}"
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={styles.ingredientsLabel}>INGREDIENTS</Text>
          <View style={styles.ingredientsRow}>
            {INGREDIENTS.map((ingredient) => (
              <View key={ingredient.id} style={styles.ingredientCircle}>
                <MaterialCommunityIcons name={ingredient.icon} size={26} color="#FF7622" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.footerTop}>
          <Text style={styles.price}>${total}</Text>

          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              <Feather name="minus" size={16} color="white" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setQuantity((current) => current + 1)}
            >
              <Feather name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addToCart} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>ADD TO CART</Text>
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
    paddingBottom: 220
  },
  hero: {
    height: 320,
    backgroundColor: '#98A8B8',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  heroButtons: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  circleButton: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24
  },
  foodName: {
    fontFamily: 'Sen_700Bold',
    fontSize: 22,
    color: '#181C2E'
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8
  },
  restaurantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: '#98A8B8'
  },
  restaurantName: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#181C2E'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 20
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  infoBold: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#181C2E'
  },
  infoText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#181C2E'
  },
  description: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 24,
    color: '#A0A5BA',
    marginTop: 20
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24
  },
  sizeLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    color: '#A0A5BA',
    marginRight: 4
  },
  sizeChip: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sizeChipSelected: {
    backgroundColor: '#FF7622'
  },
  sizeChipText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    color: '#181C2E'
  },
  sizeChipTextSelected: {
    color: '#fff'
  },
  ingredientsLabel: {
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    color: '#32343E',
    marginTop: 24
  },
  ingredientsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12
  },
  ingredientCircle: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#FFEBE4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F0F5FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  footerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  price: {
    fontFamily: 'Sen_400Regular',
    fontSize: 28,
    color: '#181C2E'
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 125,
    height: 48,
    paddingHorizontal: 8,
    borderRadius: 100,
    backgroundColor: '#121223'
  },
  stepperButton: {
    width: 26,
    height: 26,
    borderRadius: 100,
    backgroundColor: '#41414E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperValue: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#fff'
  },
  addToCart: {
    height: 62,
    borderRadius: 12,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24
  },
  addToCartText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1
  },
  notFound: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24
  },
  notFoundText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 18,
    color: '#646982',
    textAlign: 'center',
    marginTop: 80
  }
})

export default FoodDetails