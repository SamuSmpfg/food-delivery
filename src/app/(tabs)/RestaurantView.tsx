import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import FilterModal, { RestaurantFilters } from '../../components/FilterModal'
import { useCart } from '../../context/CartContext'
import { hasActiveFilters, matchesFoodFilters } from '../../lib/filters'
import { useRestaurants } from '../../../hooks/useRestaurants'
import { useDishesState, ApiDish } from '../../../hooks/useDishes'

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size))
  return rows
}

const formatPrice = (value: number) => `R$ ${value.toFixed(2)}`

const getId = (value: any): string =>
  String(value && typeof value === 'object' && value._id ? value._id : value)

const toList = (value: any): string[] =>
  Array.isArray(value) ? value.map((item) => String(item)) : value ? [String(value)] : []

type FilterFood = Parameters<typeof matchesFoodFilters>[0]
type FilterRestaurant = Parameters<typeof matchesFoodFilters>[1]

const RestaurantView = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ id: string | string[]; category?: string | string[] }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const initialCategory = Array.isArray(params.category) ? params.category[0] : params.category
  const { addItem } = useCart()
  const { restaurants, loading: loadingRestaurants } = useRestaurants()
  const { dishes, loading: loadingDishes } = useDishesState()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState<RestaurantFilters | null>(null)
  const filtersActive = hasActiveFilters(filters)

  const restaurant = restaurants.find((item) => getId(item._id) === getId(id))

  const restaurantFoods = useMemo(() => {
    if (!restaurant) return [] as ApiDish[]

    const filterRestaurant = {
      id: restaurant._id,
      name: restaurant.name,
      description: restaurant.description,
      rating: restaurant.rating,
      delivery: restaurant.deliveryFee === 0 ? 'Free' : formatPrice(restaurant.deliveryFee),
      time: `${restaurant.averageDeliveryTime} min`
    } as unknown as FilterRestaurant

    return dishes.filter(
      (dish) =>
        getId(dish.restaurantId) === getId(restaurant._id) &&
        matchesFoodFilters(
          {
            id: dish._id,
            name: dish.name,
            restaurantId: getId(dish.restaurantId),
            restaurant: restaurant.name,
            category: dish.category,
            price: dish.sizes?.[0]?.price ?? 0,
            description: dish.description
          } as unknown as FilterFood,
          filterRestaurant,
          filters,
          { includeRestaurantCriteria: false }
        )
    )
  }, [dishes, restaurant, filters])

  const categories = useMemo(
    () => Array.from(new Set(restaurantFoods.flatMap((food) => toList(food.category)))),
    [restaurantFoods]
  )

  const activeCategory =
    selectedCategory && categories.includes(selectedCategory) ? selectedCategory : categories[0]

  const visibleFoods = restaurantFoods.filter((food) =>
    toList(food.category).includes(activeCategory)
  )

  if (!restaurant) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
          <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.notFoundText}>
          {loadingRestaurants ? 'Loading...' : 'Restaurant not found'}
        </Text>
      </View>
    )
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          {restaurant.image ? (
            <Image
              source={{ uri: restaurant.image }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null}

          <View style={[styles.heroButtons, { top: insets.top + 16 }]}>
            <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
              <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.circleButton, filtersActive && styles.circleButtonActive]}
              onPress={() => setFilterVisible(true)}
            >
              <Feather
                name="more-horizontal"
                size={22}
                color={filtersActive ? '#fff' : '#181C2E'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dots}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={index}
                style={index === 2 ? styles.dotActiveOuter : styles.dot}
              >
                {index === 2 && <View style={styles.dotActiveInner} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <FontAwesome6 name="star" size={18} color="#FF7622" />
              <Text style={styles.infoBold}>{restaurant.rating}</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="truck" size={18} color="#FF7622" />
              <Text style={styles.infoText}>
                {restaurant.deliveryFee === 0 ? 'Free' : formatPrice(restaurant.deliveryFee)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="clock" size={18} color="#FF7622" />
              <Text style={styles.infoText}>{restaurant.averageDeliveryTime} min</Text>
            </View>
          </View>

          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.description}>{restaurant.description}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map((category) => {
              const selected = category === activeCategory
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {restaurantFoods.length === 0 ? (
            <Text style={styles.emptyText}>
              {loadingDishes
                ? 'Loading...'
                : filtersActive
                  ? 'No dishes match your filters, try changing them :('
                  : 'No dishes available'}
            </Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {activeCategory} ({visibleFoods.length})
              </Text>

              <View style={styles.foodGrid}>
                {chunk(visibleFoods, 2).map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.foodRow}>
                    {row.map((food) => {
                      const basePrice = food.sizes?.[0]?.price ?? 0
                      return (
                        <TouchableOpacity
                          key={food._id}
                          style={styles.foodCard}
                          activeOpacity={0.9}
                          onPress={() =>
                            router.navigate({
                              pathname: '/(tabs)/FoodDetails',
                              params: { id: food._id }
                            })
                          }
                        >
                          {food.image ? (
                            <Image
                              source={{ uri: food.image }}
                              style={styles.foodCardImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.foodCardImage} />
                          )}
                          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.foodCardName}>
                            {food.name}
                          </Text>
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={styles.foodCardRestaurant}
                          >
                            {restaurant.name}
                          </Text>
                          <View style={styles.foodCardFooter}>
                            <Text style={styles.foodCardPrice}>{formatPrice(basePrice)}</Text>
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={() =>
                                addItem({
                                  id: food._id,
                                  restaurantId: getId(restaurant._id),
                                  name: food.name,
                                  restaurant: restaurant.name,
                                  price: basePrice
                                })
                              }
                            >
                              <Feather name="plus" size={20} color="white" />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                    {row.length === 1 && <View style={styles.foodCardSpacer} />}
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={setFilters}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingBottom: 40
  },
  hero: {
    height: 320,
    backgroundColor: '#98A8B8',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden'
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
  circleButtonActive: {
    backgroundColor: '#FF7622'
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  dotActiveOuter: {
    width: 22,
    height: 22,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dotActiveInner: {
    width: 12,
    height: 12,
    borderRadius: 100,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
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
  restaurantName: {
    fontFamily: 'Sen_700Bold',
    fontSize: 22,
    color: '#181C2E',
    marginTop: 16
  },
  description: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    lineHeight: 24,
    color: '#A0A5BA',
    marginTop: 8
  },
  categoriesScroll: {
    flexGrow: 0,
    marginTop: 24,
    marginHorizontal: -24
  },
  categoriesList: {
    paddingHorizontal: 24,
    gap: 10
  },
  categoryChip: {
    height: 46,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderColor: '#EDEDED',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryChipSelected: {
    backgroundColor: '#FF7622',
    borderColor: '#FF7622'
  },
  categoryText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#181C2E'
  },
  categoryTextSelected: {
    color: '#fff'
  },
  sectionTitle: {
    fontFamily: 'Sen_400Regular',
    fontSize: 20,
    color: '#32343E',
    marginTop: 24
  },
  emptyText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#646982',
    textAlign: 'center',
    marginTop: 40
  },
  foodGrid: {
    marginTop: 16,
    gap: 16
  },
  foodRow: {
    flexDirection: 'row',
    gap: 16
  },
  foodCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#96969A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4
  },
  foodCardSpacer: {
    flex: 1
  },
  foodCardImage: {
    height: 100,
    borderRadius: 15,
    backgroundColor: '#98A8B8'
  },
  foodCardName: {
    marginTop: 12,
    fontFamily: 'Sen_700Bold',
    fontSize: 15,
    color: '#32343E'
  },
  foodCardRestaurant: {
    marginTop: 4,
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    color: '#646982'
  },
  foodCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  foodCardPrice: {
    fontFamily: 'Sen_700Bold',
    fontSize: 16,
    color: '#181C2E'
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 100,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center'
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

export default RestaurantView