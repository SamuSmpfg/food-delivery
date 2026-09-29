import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Modal } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from 'react'
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient }  from 'expo-linear-gradient';

const CATEGORIES = [
  { id: '1', name: 'All' },
  { id: '2', name: 'Hot Dog' },
  { id: '3', name: 'Burger' },
  { id: '4', name: 'Pizza' },
  { id: '5', name: 'Ice Cream' }
]

const HomeScreen = () => {

  const [searchPlate, setSearchPlate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setModalVisible(true);
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      style={styles.scrollViewProps}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.menuTouchableOpacity}>
              <Feather name="menu" size={24} color="#181C2E" />
            </TouchableOpacity>

            <View style={styles.textHeaderContainer}>
              <Text style={styles.headerDeliver}>Deliver To</Text>
              <View>
                <TouchableOpacity style={styles.locationUserPopUp}>
                  <Text style={styles.locationUser}>Halal Lab office</Text>
                  <MaterialCommunityIcons name="menu-down" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.shopIcon}>
              <Feather name="shopping-bag" size={24} color="white" />
              <Text style={styles.shopIconNotifications}>2</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeUserContainer}>
            <Text style={styles.welcomeUserNormal}>Hey Halal,</Text>
            <Text style={styles.welcomeUserBold}> Good Afternoon!</Text>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={24} color="#A0A5BA" />
            <TextInput
              style={styles.searchInput}
              placeholder= "Search dishes, restaurants"
              placeholderTextColor="#676767"
              value={searchPlate}
              onChangeText={setSearchPlate}
            />
          </View>

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
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled
          alwaysBounceVertical={false}
          style={styles.categoriesFlatList}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedCategory

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(item.id)}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipSelected : styles.categoryChipDefault
                ]}
              >
                <View style={styles.categoryImage} />
                <Text style={styles.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            )
          }}
        />

        <View style={styles.content}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.allCategoriesText}>Open Restaurants</Text>
            <View style={styles.seeAllContent}>
              <TouchableOpacity style={styles.seeAllTouchableOpacity}>
                <Text style={styles.seeAllText}>See All</Text>
                <Entypo name="chevron-right" size={20} color="#A0A5BA" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.openRestaurantsContainer}>
          <View>
            <View style={styles.restaurantsImage}/>
            <Text style={styles.restaurantName}>Rose Garden Restaurant</Text>
            <Text style={styles.restaurantPlates}>Burger - Chiken - Riche - Wings </Text>
            <View style={styles.restaurantsExtras}>
              <View style={styles.restaurantIconAndTextContainer}>
                <FontAwesome6 name="star" size={30} color="#FF7622" />
                <Text style={styles.restaurantRatingText}>4.7</Text>
              </View>

              <View style={styles.restaurantIconAndTextContainer}>
                <MaterialCommunityIcons name="truck-fast-outline" size={30} color="#FF7622" />
                <Text style={styles.restaurantExtrasText}>Free</Text>
              </View>

              <View style={styles.restaurantIconAndTextContainer}>
                <AntDesign name="clock-circle" size={30} color="#FF7622" />
                <Text style={styles.restaurantExtrasText}>20 min</Text>
              </View>
            </View>
          </View>

          <View>
            <View style={styles.restaurantsImage}/>
            <Text style={styles.restaurantName}>Mamma Mia</Text>
            <Text style={styles.restaurantPlates}>Burger - Chiken - Riche - Wings </Text>
            <View style={styles.restaurantsExtras}>
              <View style={styles.restaurantIconAndTextContainer}>
                <FontAwesome6 name="star" size={30} color="#FF7622" />
                <Text style={styles.restaurantRatingText}>3.9</Text>
              </View>

              <View style={styles.restaurantIconAndTextContainer}>
                <MaterialCommunityIcons name="truck-fast-outline" size={30} color="#FF7622" />
                <Text style={styles.restaurantExtrasText}>$15</Text>
              </View>

              <View style={styles.restaurantIconAndTextContainer}>
                <AntDesign name="clock-circle" size={30} color="#FF7622" />
                <Text style={styles.restaurantExtrasText}>35 min</Text>
              </View>
            </View>
          </View>

          <View>
            <View style={styles.restaurantsImage}/>
            <Text style={styles.restaurantName}>Madero Burguer</Text>
            <Text style={styles.restaurantPlates}>Burger - Chiken - Riche - Wings </Text>
            <View style={styles.restaurantsExtras}>
              <View style={styles.restaurantIconAndTextContainer}>
                <FontAwesome6 name="star" size={30} color="#FF7622" />
                <Text style={styles.restaurantRatingText}>4.3</Text>
              </View>

              <View style={styles.restaurantIconAndTextContainer}>
                <MaterialCommunityIcons name="truck-fast-outline" size={30} color="#FF7622" />
                <Text style={styles.restaurantExtrasText}>$10</Text>
              </View>

              <View style={styles.restaurantIconAndTextContainer}>
                <AntDesign name="clock-circle" size={30} color="#FF7622" />
                <Text style={styles.restaurantExtrasText}>25 min</Text>
              </View>
            </View>
          </View>
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
  textHeaderContainer: {
    marginLeft: 12
  },
  headerDeliver: {
    fontFamily: "Sen_700Bold",
    color: '#FF7622',
    fontSize: 14
  },
  locationUser: {
    color: '#676767',
    fontSize: 12,
    fontFamily: "Sen_400Regular"
  },
  locationUserPopUp: {
    flexDirection: 'row'
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
    marginBottom: 10
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
    zIndex: 1
  }
})

export default HomeScreen