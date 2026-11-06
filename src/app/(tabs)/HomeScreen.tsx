import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Modal, BackHandler } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useMemo } from 'react'
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient }  from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext'
import { useUser } from '@clerk/clerk-expo';
import { useAccountAddress } from '../../../hooks/useAccountAddress';
import useBackHandler from '../../../hooks/useBackHandler'
import { useRestaurants } from '../../../hooks/useRestaurants'
import { useDishes } from '../../../hooks/useDishes'
import { useAddresses } from '../../lib/addressStore'
import { useSelectedAddressId } from '../../lib/selectedAddressStore'

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

const ALL_CATEGORY = 'All'

const HomeScreen = () => {
  const router = useRouter()
  const { count } = useCart()
  const { user } = useUser();
  const { address, loading } = useAccountAddress();
  const { restaurants: restaurantsData, loading: loadingRestaurants, error: restaurantsError } = useRestaurants()
  const restaurants = restaurantsData ?? []
  const dishesData = useDishes()
  const dishes = Array.isArray(dishesData) ? dishesData : []

  const addresses = useAddresses();
  const selectedAddressId = useSelectedAddressId();

  const selectedAddress = addresses.find((item) => item.id === selectedAddressId);
  const selectedAddressText = selectedAddress
    ? `${selectedAddress.address}${selectedAddress.apartment ? ` - Apt ${selectedAddress.apartment}` : ''}`
    : null;

  useBackHandler(() => BackHandler.exitApp())

  const firstName = user?.firstName ?? '';

  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setModalVisible(true);
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>([normalize(ALL_CATEGORY)])
    const names: string[] = [ALL_CATEGORY]

    dishes.forEach((dish) =>
      toList(dish.category).forEach((name) => {
        const key = normalize(name)
        if (!key || seen.has(key)) return
        seen.add(key)
        names.push(name)
      })
    )

    return names
  }, [dishesData])

  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : ALL_CATEGORY

  const visibleRestaurants = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return restaurants

    const target = normalize(activeCategory)
    const restaurantIds = new Set<string>()

    dishes.forEach((dish) => {
      if (toList(dish.category).some((name) => normalize(name) === target)) {
        restaurantIds.add(getId(dish.restaurantId))
      }
    })

    return restaurants.filter((restaurant: any) => {
      if (restaurantIds.has(getId(restaurant._id))) return true
      return toList(restaurant.category).some((name) => normalize(name) === target)
    })
  }, [activeCategory, restaurantsData, dishesData])

  const getMatchedCategory = (restaurantId: string): string => {
    if (activeCategory === ALL_CATEGORY) return ''
    const target = normalize(activeCategory)
    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i]
      if (getId(dish.restaurantId) !== getId(restaurantId)) continue
      const matched = toList(dish.category).find((name) => normalize(name) === target)
      if (matched) return matched
    }
    return ''
  }

  return (
    <ScrollView
      style={styles.scrollViewProps}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
            style={styles.menuTouchableOpacity}
            onPress={() => router.navigate('/(tabs)/Profile')}
            >
              <Feather name="menu" size={24} color="#181C2E" />
            </TouchableOpacity>

            <View style={styles.textHeaderContainer}>
              <Text style={styles.headerDeliver}>Deliver To</Text>
              <TouchableOpacity
                style={styles.locationUserPopUp}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/Adresses', params: { select: 'true' } })
                }
              >
                <Text
                  style={styles.locationUser}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedAddressText ?? (loading ? 'Loading...' : address || 'Add an address')}
                </Text>
                <MaterialCommunityIcons name="menu-down" size={24} color="#676767" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
            style={styles.shopIcon}
            onPress={() => router.navigate('/(tabs)/Cart')}
            >
              <Feather name="shopping-bag" size={24} color="white" />
              {count > 0 && (
                <Text style={styles.shopIconNotifications}>{count > 99 ? '99+' : count}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeUserContainer}>
            <Text style={styles.welcomeUserNormal}>Hey {firstName},</Text>
            <Text style={styles.welcomeUserBold}> Good Afternoon!</Text>
          </View>

          <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.navigate('/(tabs)/Search')}
          >
            <Feather name="search" size={24} color="#A0A5BA" />
              <Text style={styles.searchInput}>Search dishes, restaurants</Text>
          </TouchableOpacity>

          <View style={styles.categoriesHeader}>
            <Text style={styles.allCategoriesText}>All Categories</Text>

            <View style={styles.seeAllContent}>
              <TouchableOpacity style={styles.seeAllTouchableOpacity}>
                <Text style={styles.seeAllText}>See All</Text>
                <Entypo name="chevron-right" size={20} color="#A0A5BA" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled
          alwaysBounceVertical={false}
          style={styles.categoriesFlatList}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = item === activeCategory

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipSelected : styles.categoryChipDefault
                ]}
              >
                <View style={styles.categoryImage} />
                <Text style={styles.categoryText}>{item}</Text>
              </TouchableOpacity>
            )
          }}
        />

        <View style={styles.content}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.allCategoriesText}>
              {activeCategory === ALL_CATEGORY ? 'Open Restaurants' : `${activeCategory} Restaurants`}
            </Text>
            <View style={styles.seeAllContent}>
              <TouchableOpacity style={styles.seeAllTouchableOpacity}>
                <Text style={styles.seeAllText}>See All</Text>
                <Entypo name="chevron-right" size={20} color="#A0A5BA" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.openRestaurantsContainer}>
          {loadingRestaurants && <Text style={styles.restaurantPlates}>Loading...</Text>}
          {restaurantsError && <Text style={styles.restaurantPlates}>{restaurantsError}</Text>}
          {visibleRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant._id}
              activeOpacity={0.9}
              onPress={() =>
                router.navigate({
                  pathname: '/(tabs)/RestaurantView',
                  params: { id: restaurant._id, category: getMatchedCategory(restaurant._id) }
                })
              }
            >
              <View style={styles.restaurantsImage}/>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.restaurantName}>{restaurant.name}</Text>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.restaurantPlates}>{restaurant.specialty.join(' - ')}</Text>
              <View style={styles.restaurantsExtras}>
                <View style={styles.restaurantIconAndTextContainer}>
                  <FontAwesome6 name="star" size={30} color="#FF7622" />
                  <Text style={styles.restaurantRatingText}>{restaurant.rating}</Text>
                </View>

                <View style={styles.restaurantIconAndTextContainer}>
                  <Feather name="truck" size={30} color="#FF7622" />
                  <Text style={styles.restaurantExtrasText}>
                    {restaurant.deliveryFee === 0 ? 'Free' : `R$ ${restaurant.deliveryFee.toFixed(2)}`}
                  </Text>
                </View>

                <View style={styles.restaurantIconAndTextContainer}>
                  <AntDesign name="clock-circle" size={30} color="#FF7622" />
                  <Text style={styles.restaurantExtrasText}>{restaurant.averageDeliveryTime} min</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {!loadingRestaurants && !restaurantsError && visibleRestaurants.length === 0 && (
            <Text style={styles.restaurantPlates}>No restaurants in this category.</Text>
          )}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>

            <TouchableOpacity
              style={styles.closeXButton}
              onPress={() => setModalVisible(false)}
            >
                <Feather name="x" size={24} color="#EF761A" />
              </TouchableOpacity>
            <LinearGradient
              style={styles.modalGradient}
              colors={['#F9DC50', '#DB7428']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 0.8 }}
            >

              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Hurry Offers!</Text>

                <View style={styles.discountContainer}>
                  <Text style={styles.discountCode}>#1243CD2</Text>
                  <Text style={styles.discountText}>Use the cupon get 25% discount</Text>
                </View>

                <View style={styles.closeButtonBorder}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>GOT IT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Modal>

      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 24
  },
  headerContainer: {
    flexDirection: 'row',
    width: 'auto',
    height: 49,
    alignItems: 'center'
  },
  menuTouchableOpacity: {
    backgroundColor: '#ECF0F4',
    height: 49,
    width: 49,
    padding: 12,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  headerDeliver: {
    fontFamily: "Sen_700Bold",
    color: '#FF7622',
    fontSize: 14
  },
  textHeaderContainer: {
    flex: 1,
    marginHorizontal: 12
  },
  locationUserPopUp: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%'
  },
  locationUser: {
    flexShrink: 1,
    color: '#676767',
    fontSize: 12,
    fontFamily: 'Sen_400Regular'
  },
  shopIcon: {
    backgroundColor: '#181C2E',
    height: 49,
    width: 49,
    padding: 12,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    marginLeft: "auto"
  },
  shopIconNotifications: {
    fontFamily: "Sen_700Bold",
    color: "#fff",
    fontSize: 14,
    backgroundColor: '#FF7622',
    minWidth: 25,
    height: 25,
    lineHeight: 25,
    textAlign: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    paddingHorizontal: 4,
    position: "absolute",
    top: -3,
    left: 20,
  },
  welcomeUserContainer: {
    flexDirection: 'row',
    marginTop: 32
  },
  welcomeUserNormal: {
    color: '#000',
    fontSize: 16,
    fontFamily: "Sen_400Regular"
  },
  welcomeUserBold: {
    color: '#000',
    fontSize: 16,
    fontFamily: "Sen_700Bold"
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
    height: 62,
    backgroundColor: '#F6F6F6',
    paddingLeft: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 32
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    fontFamily: "Sen_400Regular",
    fontSize: 14,
    color: '#676767',
    marginTop: 38
  },
  categoriesHeader: {
    flexDirection: 'row',
    marginTop: 16
  },
  allCategoriesText: {
    fontSize: 16,
    fontFamily: "Sen_400Regular",
    color: '#333333'
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: "Sen_400Regular",
    color: '#333333'
  },
  seeAllContent: {
    flexDirection: 'row',
    marginLeft: "auto",
  },
  seeAllTouchableOpacity: {
    flexDirection: 'row',
  },
  categoriesFlatList: {
    flexGrow: 0
  },
  categoriesList: {
    paddingVertical: 16,
    paddingHorizontal: 24
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    width: 'auto',
    paddingLeft: 6,
    paddingRight: 24,
    marginRight: 12,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  categoryChipDefault: {
    backgroundColor: '#FFFFFF'
  },
  categoryChipSelected: {
    backgroundColor: '#FFD27C'
  },
  categoryImage: {
    width: 46,
    height: 46,
    borderRadius: 100,
    backgroundColor: '#9CA8B8'
  },
  categoryText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#32343E',
    fontFamily: 'Sen_700Bold'
  },
  openRestaurantsContainer: {
    width: 'auto',
    height: "auto",
    paddingHorizontal: 24,
  },
  restaurantsImage: {
    width: 'auto',
    height: 162,
    borderRadius: 10,
    backgroundColor: '#9CA8B8',
    marginTop: 32
  },
  restaurantName: {
    fontSize: 20,
    fontFamily: "Sen_400Regular",
    color: '#181C2E',
    marginVertical: 10
  },
  restaurantPlates: {
    fontSize: 14,
    fontFamily: "Sen_400Regular",
    color: '#A0A5BA',
    marginBottom: 24  
  },
  restaurantsExtras: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  restaurantIconAndTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  restaurantRatingText: {
    fontSize: 16,
    color: '#181C2E',
    fontFamily: 'Sen_700Bold'
  },
  restaurantExtrasText: {
    fontSize: 16,
    color: '#181C2E',
    fontFamily: 'Sen_400Regular'
  },
  scrollViewProps: {
    height: 'auto',
    backgroundColor: '#fff'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(70, 86, 105, 0.75)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalGradient: {
    width: 327,
    height: 395,
    borderRadius: 35,
    paddingTop: 85,
    paddingHorizontal: 24
  },
  modalContent: {
    alignItems: 'center',
    width: '100%'
  },
  modalText: {
    fontSize: 34,
    color: '#fff',
    fontFamily: 'Sen_800ExtraBold'
  },
  discountContainer: {
    alignItems: 'center',
    marginTop: 51
  },
  discountCode: {
    fontSize: 30,
    color: '#fff',
    fontFamily: 'Sen_700Bold'
  },
  discountText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Sen_700Bold',
    marginTop: 34
  },
  closeButtonBorder: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 16,
    justifyContent: 'center',
    alignSelf: 'center',
    height: 62,
    width: 279,
    marginTop: 33
  },
  closeButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Sen_700Bold'
  },
  closeXButton: {
    position: 'absolute',
    top: 210,
    right: 25,
    backgroundColor: '#FFE194',
    width: 45,
    height: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  }
})

export default HomeScreen