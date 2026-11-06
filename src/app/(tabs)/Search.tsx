import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ScrollView, Image } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useRef, useState, ComponentRef } from 'react'
import { useRouter } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FilterModal, { RestaurantFilters } from '@/components/FilterModal';
import { useCart } from '@/context/CartContext';
import { hasActiveFilters, matchesFoodFilters, matchesRestaurantFilters } from '@/lib/filters';
import { useRestaurants } from '../../../hooks/useRestaurants'
import { useDishesState, ApiDish } from '../../../hooks/useDishes'

const ACCENTS: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a',
  é: 'e', è: 'e', ê: 'e',
  í: 'i', ì: 'i', î: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', û: 'u',
  ç: 'c',
}

const normalize = (value: unknown): string =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[àáâãäèéêìíîòóôõùúûç]/g, (c) => ACCENTS[c] ?? c)

const getId = (value: any): string =>
  String(value && typeof value === 'object' && value._id ? value._id : value)

const toList = (value: any): string[] =>
  Array.isArray(value) ? value.map((item) => String(item)) : value ? [String(value)] : []

const formatPrice = (value: number) => `R$ ${Number(value ?? 0).toFixed(2)}`

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size))
  return rows
}

type FilterFood = Parameters<typeof matchesFoodFilters>[0]
type FilterRestaurant = Parameters<typeof matchesFoodFilters>[1]

const toFilterRestaurant = (restaurant: any) =>
  ({
    id: restaurant._id,
    name: restaurant.name,
    description: restaurant.description,
    rating: restaurant.rating,
    delivery: restaurant.deliveryFee === 0 ? 'Free' : formatPrice(restaurant.deliveryFee),
    time: `${restaurant.averageDeliveryTime} min`
  }) as unknown as FilterRestaurant

const toFilterFood = (dish: ApiDish, restaurantName: string) =>
  ({
    id: dish._id,
    name: dish.name,
    restaurantId: getId(dish.restaurantId),
    restaurant: restaurantName,
    category: dish.category,
    price: dish.sizes?.[0]?.price ?? 0,
    description: dish.description
  }) as unknown as FilterFood

const Search = () => {
  const router = useRouter()
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null)
  const [query, setQuery] = useState('')
  const { count, addItem } = useCart()
  const { restaurants: restaurantsData, loading: loadingRestaurants } = useRestaurants()
  const { dishes: dishesData, loading: loadingDishes } = useDishesState()
  const restaurants = restaurantsData ?? []
  const dishes = useMemo(
    () => (Array.isArray(dishesData) ? dishesData : []).filter((dish: any) => dish.available !== false),
    [dishesData]
  )

  const normalizedQuery = normalize(query)
  const isSearching = normalizedQuery.length > 0
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState<RestaurantFilters | null>(null)
  const filtersActive = hasActiveFilters(filters)

  const restaurantsById = useMemo(() => {
    const map = new Map<string, any>()
    restaurants.forEach((restaurant: any) => map.set(getId(restaurant._id), restaurant))
    return map
  }, [restaurantsData])

  const keywords = useMemo(() => {
    const seen = new Set<string>()
    const names: string[] = []
    dishes.forEach((dish) =>
      toList(dish.category).forEach((name) => {
        const key = normalize(name)
        if (!key || seen.has(key)) return
        seen.add(key)
        names.push(name)
      })
    )
    return names.slice(0, 8)
  }, [dishes])

  const suggestedRestaurants = useMemo(
    () => [...restaurants].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3),
    [restaurantsData]
  )

  const popularDishes = useMemo(
    () => [...dishes].sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0)).slice(0, 4),
    [dishes]
  )

  const filteredFoods = useMemo(() => {
    if (!normalizedQuery) return []
    return dishes.filter((dish) => {
      const restaurant = restaurantsById.get(getId(dish.restaurantId))
      const restaurantName = restaurant?.name ?? ''
      const matchesQuery =
        normalize(dish.name).includes(normalizedQuery) ||
        normalize(restaurantName).includes(normalizedQuery) ||
        toList(dish.category).some((name) => normalize(name).includes(normalizedQuery))
      if (!matchesQuery) return false
      if (!restaurant) return true

      return matchesFoodFilters(
        toFilterFood(dish, restaurantName),
        toFilterRestaurant(restaurant),
        filters
      )
    })
  }, [normalizedQuery, filters, dishes, restaurantsById])

  const filteredRestaurants = useMemo(() => {
    if (!normalizedQuery) return []
    const restaurantIdsWithFood = new Set<string>(
      filteredFoods.map((dish) => getId(dish.restaurantId))
    )
    return restaurants.filter((restaurant: any) => {
      const matchesQuery =
        normalize(restaurant.name).includes(normalizedQuery) ||
        toList(restaurant.specialty).some((name) => normalize(name).includes(normalizedQuery)) ||
        toList(restaurant.category).some((name) => normalize(name).includes(normalizedQuery)) ||
        restaurantIdsWithFood.has(getId(restaurant._id))
      if (!matchesQuery) return false

      return matchesRestaurantFilters(toFilterRestaurant(restaurant) as any, filters)
    })
  }, [normalizedQuery, filteredFoods, filters, restaurantsData])

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const handleSelectKeyword = (keyword: string) => {
    setQuery(keyword)
    inputRef.current?.focus()
  }

  const goToRestaurant = (id: string) => {
    router.navigate({ pathname: '/(tabs)/RestaurantView', params: { id } })
  }

  const goToFood = (id: string) => {
    router.navigate({ pathname: '/(tabs)/FoodDetails', params: { id } })
  }

  const handleAddDish = (dish: ApiDish) => {
    const restaurant = restaurantsById.get(getId(dish.restaurantId))
    addItem({
      id: dish._id,
      restaurantId: getId(dish.restaurantId),
      name: dish.name,
      restaurant: restaurant?.name ?? '',
      price: dish.sizes?.[0]?.price ?? 0
    })
  }

  const renderHeader = () => {
    if (!isSearching) {
      return (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.returnTouchableOpacity}
            onPress={() => router.back()}
          >
            <MaterialIcons name="keyboard-arrow-left" size={30} color="#181C2E" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Search</Text>

          <TouchableOpacity
            style={styles.shoppingBagContainer}
            onPress={() => router.navigate('/(tabs)/Cart')}
          >
            <Feather name="shopping-bag" size={24} color="white" />
            {count > 0 && (
              <Text style={styles.shoppingBagNotifications}>{count > 99 ? '99+' : count}</Text>
            )}
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.returnTouchableOpacity}
          onPress={() => router.back()}
        >
          <MaterialIcons name="keyboard-arrow-left" size={30} color="#181C2E" />
        </TouchableOpacity>

        <View style={styles.queryPill}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.queryPillText}>
            {query.trim().toUpperCase()}
          </Text>
          <Ionicons name="caret-down" size={12} color="#FF7622" />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.searchActionButton}
            onPress={() => inputRef.current?.focus()}
          >
            <Feather name="search" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterActionButton, filtersActive && styles.filterActionButtonActive]}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={24}
              color={filtersActive ? '#fff' : '#181C2E'}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderDefaultContent = () => (
    <>
      {keywords.length > 0 && (
        <>
          <Text style={styles.titles}>Recent Keywords</Text>

          <FlatList
            data={keywords}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.keywordsFlatList}
            contentContainerStyle={styles.keywordsList}
            ItemSeparatorComponent={() => <View style={styles.keywordSeparator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.keywordItem}
                onPress={() => handleSelectKeyword(item)}
              >
                <Text style={styles.keywordText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <View style={styles.suggested}>
        <Text style={styles.titles}>Suggested Restaurants</Text>

        {(loadingRestaurants || loadingDishes) && (
          <Text style={styles.loadingText}>Loading...</Text>
        )}

        {suggestedRestaurants.map((restaurant: any) => (
          <View key={restaurant._id}>
            <TouchableOpacity
              style={styles.restaurantContainer}
              onPress={() => goToRestaurant(restaurant._id)}
            >
              {restaurant.image ? (
                <Image
                  source={{ uri: restaurant.image }}
                  style={styles.restaurantImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.restaurantImage} />
              )}
              <View style={styles.sugestedRestaurant}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.sugestedRestaurantNameAndRating}>{restaurant.name}</Text>
                <View style={styles.sugestedRestaurantRating}>
                  <FontAwesome6 name="star" size={20} color="#FF7622" />
                  <Text style={styles.sugestedRestaurantNameAndRating}>{restaurant.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.lineDivisor}/>
          </View>
        ))}

        {popularDishes.length > 0 && <Text style={styles.titles}>Popular Dishes</Text>}

        {chunk(popularDishes, 2).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.fastFoodContainer}>
            {row.map((dish) => {
              const restaurant = restaurantsById.get(getId(dish.restaurantId))
              return (
                <View key={dish._id} style={styles.popularFastFoodContainer}>
                  <TouchableOpacity
                    style={styles.popularRestaurantBoxExtra}
                    onPress={() => goToFood(dish._id)}
                  >
                    <View style={styles.restaurantInfoContainer}>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.popularFoodName}>{dish.name}</Text>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.popularRestaurantName}>{restaurant?.name ?? ''}</Text>
                    </View>
                    {dish.image ? (
                      <Image
                        source={{ uri: dish.image }}
                        style={styles.popularFoodImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.popularFoodImage}/>
                    )}
                  </TouchableOpacity>
                </View>
              )
            })}
            {row.length === 1 && <View style={styles.popularSpacer}/>}
          </View>
        ))}
      </View>
    </>
  )

  const renderResults = () => {
    if (filteredFoods.length === 0 && filteredRestaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {loadingRestaurants || loadingDishes
              ? 'Loading...'
              : filtersActive
                ? 'Nothing matches your filters, try changing them :('
                : 'Could not find your dish, try another plate :('}
          </Text>
        </View>
      )
    }

    return (
      <>
        {filteredFoods.length > 0 && (
          <>
            <Text style={styles.titles}>Popular {query.trim()}</Text>

            <View style={styles.foodGrid}>
              {chunk(filteredFoods, 2).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.foodRow}>
                  {row.map((food) => {
                    const restaurant = restaurantsById.get(getId(food.restaurantId))
                    return (
                      <TouchableOpacity
                        key={food._id}
                        style={styles.foodCard}
                        activeOpacity={0.9}
                        onPress={() => goToFood(food._id)}
                      >
                        {food.image ? (
                          <Image
                            source={{ uri: food.image }}
                            style={styles.foodCardImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.foodCardImage}/>
                        )}
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.foodCardName}>{food.name}</Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.foodCardRestaurant}>{restaurant?.name ?? ''}</Text>
                        <View style={styles.foodCardFooter}>
                          <Text style={styles.foodCardPrice}>{formatPrice(food.sizes?.[0]?.price ?? 0)}</Text>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddDish(food)}
                          >
                            <Feather name="plus" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                  {row.length === 1 && <View style={styles.foodCardSpacer}/>}
                </View>
              ))}
            </View>
          </>
        )}

        {filteredRestaurants.length > 0 && (
          <>
            <Text style={styles.titles}>Open Restaurants</Text>

            {filteredRestaurants.map((restaurant: any) => (
              <TouchableOpacity
                key={restaurant._id}
                style={styles.openRestaurant}
                activeOpacity={0.9}
                onPress={() => goToRestaurant(restaurant._id)}
              >
                {restaurant.image ? (
                  <Image
                    source={{ uri: restaurant.image }}
                    style={styles.openRestaurantImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.openRestaurantImage}/>
                )}
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.openRestaurantName}>{restaurant.name}</Text>
                <View style={styles.openRestaurantInfo}>
                  <View style={styles.openRestaurantInfoItem}>
                    <FontAwesome6 name="star" size={16} color="#FF7622" />
                    <Text style={styles.openRestaurantInfoText}>{restaurant.rating}</Text>
                  </View>
                  <View style={styles.openRestaurantInfoItem}>
                    <Feather name="truck" size={16} color="#FF7622" />
                    <Text style={styles.openRestaurantInfoText}>
                      {restaurant.deliveryFee === 0 ? 'Free' : formatPrice(restaurant.deliveryFee)}
                    </Text>
                  </View>
                  <View style={styles.openRestaurantInfoItem}>
                    <Feather name="clock" size={16} color="#FF7622" />
                    <Text style={styles.openRestaurantInfoText}>{restaurant.averageDeliveryTime} min</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </>
    )
  }

  return (
    <ScrollView
      style={styles.scrollViewContainer}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {renderHeader()}

        <View style={styles.searchContainer}>
          <Feather name="search" size={24} color="#A0A5BA" />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Pizza"
            placeholderTextColor="#676767"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearTextInput}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#CDCDCF" />
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? renderResults() : renderDefaultContent()}
      </SafeAreaView>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={setFilters}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 40
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  returnTouchableOpacity: {
    width: 50,
    height: 50,
    backgroundColor: '#ECF0F4',
    borderRadius: 100,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pageTitle: {
    fontFamily: "Sen_400Regular",
    fontSize: 17,
    color: '#181C2E',
  },
  shoppingBagContainer: {
    backgroundColor: '#181C2E',
    width: 50,
    height: 50,
    borderRadius: 100,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shoppingBagNotifications: {
    fontFamily: "Sen_700Bold",
    color: "#fff",
    fontSize: 14,
    backgroundColor: '#FF7622',
    minWidth: 25,
    height: 25,
    lineHeight: 25,
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: 100,
    paddingHorizontal: 4,
    position: "absolute",
    top: -3,
    left: 20,
  },
  queryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    maxWidth: 140,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 100
  },
  queryPillText: {
    flexShrink: 1,
    fontFamily: "Sen_700Bold",
    fontSize: 14,
    color: '#181C2E'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 'auto'
  },
  searchActionButton: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#181C2E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterActionButton: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#ECF0F4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterActionButtonActive: {
    backgroundColor: '#FF7622'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
    height: 62,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 32
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 16,
    fontFamily: "Sen_400Regular",
    fontSize: 14,
    color: '#181C2E'
  },
  clearTextInput: {
    marginLeft: 8
  },
  titles: {
    fontFamily: "Sen_400Regular",
    fontSize: 20,
    color: '#32343E',
    marginTop: 24
  },
  loadingText: {
    fontFamily: "Sen_400Regular",
    fontSize: 14,
    color: '#A0A5BA',
    marginTop: 16
  },
  keywordsFlatList: {
    flexGrow: 0,
    marginTop: 16,
    marginHorizontal: -24
  },
  keywordsList: {
    paddingVertical: 4,
    paddingHorizontal: 24
  },
  keywordSeparator: {
    width: 10
  },
  keywordItem: {
    height: 46,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#EDEDED',
    backgroundColor: 'transparent',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keywordText: {
    fontFamily: "Sen_400Regular",
    fontSize: 16,
    color: '#181C2E'
  },
  suggested: {
    width: '100%',
    height: 'auto'
  },
  restaurantContainer: {
    width: '100%',
    height: 64,
    marginTop: 16,
    flexDirection: 'row'
  },
  restaurantImage: {
    width: 70,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#98A8B8'
  },
  sugestedRestaurant: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 16,
  },
  sugestedRestaurantNameAndRating: {
    color: '#32343E',
    fontSize: 16,
    fontFamily: "Sen_400Regular",
  },
  sugestedRestaurantRating: {
    flexDirection: 'row',
    gap: 8
  },
  lineDivisor: {
    width: 'auto',
    height: 1,
    backgroundColor: '#EBEBEB',
    marginTop: 12
  },
  popularFastFoodContainer: {
    flex: 1,
    marginTop: 80,
  },
  popularSpacer: {
    flex: 1
  },
  popularFoodImage: {
    backgroundColor: '#98A8B8',
    width: 140,
    height: 92,
    borderRadius: 15,
    top: -90,
    right: -2,
  },
  popularRestaurantBoxExtra: {
    backgroundColor: '#fff',
    width: '100%',
    height: 110,
    borderRadius: 15,
    shadowColor: '#96969A26',
    shadowOffset: { width: 16, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    paddingHorizontal: 8,
  },
  fastFoodContainer: {
    flexDirection: 'row',
    gap: 24
  },
  popularFoodName: {
    color: '#32343E',
    fontFamily: "Sen_700Bold",
    fontSize: 14
  },
  popularRestaurantName: {
    color: '#646982',
    fontFamily: "Sen_400Regular",
    fontSize: 10
  },
  restaurantInfoContainer: {
    top: 50,
    right: -10,
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80
  },
  emptyText: {
    fontFamily: "Sen_400Regular",
    fontSize: 18,
    color: '#646982',
    textAlign: 'center'
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
    fontFamily: "Sen_700Bold",
    fontSize: 15,
    color: '#32343E'
  },
  foodCardRestaurant: {
    marginTop: 4,
    fontFamily: "Sen_400Regular",
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
    fontFamily: "Sen_700Bold",
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
  openRestaurant: {
    marginTop: 16
  },
  openRestaurantImage: {
    height: 140,
    borderRadius: 15,
    backgroundColor: '#98A8B8'
  },
  openRestaurantName: {
    marginTop: 12,
    fontFamily: "Sen_400Regular",
    fontSize: 20,
    color: '#181C2E'
  },
  openRestaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 8
  },
  openRestaurantInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  openRestaurantInfoText: {
    fontFamily: "Sen_400Regular",
    fontSize: 14,
    color: '#181C2E'
  }
})

export default Search