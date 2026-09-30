import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ScrollView } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { KEYWORDS, RESTAURANTS, FOODS, FAST_FOODS, chunk } from '../../data/mockData'

const Search = () => {

  const router = useRouter()
  const inputRef = useRef<TextInput>(null)
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0

  const filteredFoods = useMemo(() => {
    if (!normalizedQuery) return []
    return FOODS.filter((food) =>
      food.name.toLowerCase().includes(normalizedQuery) ||
      food.restaurant.toLowerCase().includes(normalizedQuery) ||
      food.category.toLowerCase().includes(normalizedQuery)
    )
  }, [normalizedQuery])

  const filteredRestaurants = useMemo(() => {
    if (!normalizedQuery) return []
    const restaurantsWithFood = filteredFoods.map((food) => food.restaurant)
    return RESTAURANTS.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(normalizedQuery) ||
      restaurantsWithFood.includes(restaurant.name)
    )
  }, [normalizedQuery, filteredFoods])

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

          <TouchableOpacity style={styles.shoppingBagContainer}>
            <Feather name="shopping-bag" size={30} color="white" />
            <Text style={styles.shoppingBagNotifications}>2</Text>
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
          <TouchableOpacity style={styles.filterActionButton}>
            <Ionicons name="options-outline" size={24} color="#181C2E" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderDefaultContent = () => (
    <>
      <Text style={styles.titles}>Recent Keywords</Text>

      <FlatList
        data={KEYWORDS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.keywordsFlatList}
        contentContainerStyle={styles.keywordsList}
        ItemSeparatorComponent={() => <View style={styles.keywordSeparator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.keywordItem}
            onPress={() => handleSelectKeyword(item.name)}
          >
            <Text style={styles.keywordText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.suggested}>
        <Text style={styles.titles}>Suggested Restaurants</Text>

        {RESTAURANTS.slice(0, 3).map((restaurant) => (
          <View key={restaurant.id}>
            <TouchableOpacity
              style={styles.restaurantContainer}
              onPress={() => goToRestaurant(restaurant.id)}
            >
              <View style={styles.restaurantImage}/>
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

        <Text style={styles.titles}>Popular Fast food</Text>

        {chunk(FAST_FOODS, 2).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.fastFoodContainer}>
            {row.map((food) => (
              <View key={food.id} style={styles.popularFastFoodContainer}>
                <TouchableOpacity
                  style={styles.popularRestaurantBoxExtra}
                  onPress={() => goToFood(food.id)}
                >
                  <View style={styles.restaurantInfoContainer}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.popularFoodName}>{food.name}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.popularRestaurantName}>{food.restaurant}</Text>
                  </View>
                  <View style={styles.popularFoodImage}/>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </View>
    </>
  )

  const renderResults = () => {
    if (filteredFoods.length === 0 && filteredRestaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>could not find your dish, try another plate :(</Text>
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
                  {row.map((food) => (
                    <TouchableOpacity
                      key={food.id}
                      style={styles.foodCard}
                      activeOpacity={0.9}
                      onPress={() => goToFood(food.id)}
                    >
                      <View style={styles.foodCardImage}/>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.foodCardName}>{food.name}</Text>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.foodCardRestaurant}>{food.restaurant}</Text>
                      <View style={styles.foodCardFooter}>
                        <Text style={styles.foodCardPrice}>${food.price}</Text>
                        <TouchableOpacity style={styles.addButton}>
                          <Feather name="plus" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {row.length === 1 && <View style={styles.foodCardSpacer}/>}
                </View>
              ))}
            </View>
          </>
        )}

        {filteredRestaurants.length > 0 && (
          <>
            <Text style={styles.titles}>Open Restaurants</Text>

            {filteredRestaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.openRestaurant}
                activeOpacity={0.9}
                onPress={() => goToRestaurant(restaurant.id)}
              >
                <View style={styles.openRestaurantImage}/>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.openRestaurantName}>{restaurant.name}</Text>
                <View style={styles.openRestaurantInfo}>
                  <View style={styles.openRestaurantInfoItem}>
                    <FontAwesome6 name="star" size={16} color="#FF7622" />
                    <Text style={styles.openRestaurantInfoText}>{restaurant.rating}</Text>
                  </View>
                  <View style={styles.openRestaurantInfoItem}>
                    <Feather name="truck" size={16} color="#FF7622" />
                    <Text style={styles.openRestaurantInfoText}>{restaurant.delivery}</Text>
                  </View>
                  <View style={styles.openRestaurantInfoItem}>
                    <Feather name="clock" size={16} color="#FF7622" />
                    <Text style={styles.openRestaurantInfoText}>{restaurant.time}</Text>
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
    fontSize: 16,
    backgroundColor: '#FF7622',
    width: 25,
    height: 25,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    paddingLeft: 6,
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
    width: 327,
    height: 'auto'
  },
  restaurantContainer: {
    width: 327,
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
    marginTop: 80,
  },
  popularFoodImage: {
    backgroundColor: '#98A8B8',
    width: 140,
    height: 92,
    borderRadius: 15,
    top: -90,
    right: -10
  },
  popularRestaurantBoxExtra: {
    backgroundColor: '#fff',
    width: 160,
    height: 110,
    borderRadius: 15,
    shadowColor: '#96969A26',
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 4
  },
  fastFoodContainer: {
    flexDirection: 'row',
    gap: 32
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
    padding: 6
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