import FoodClassTabScreen, { FOOD_CLASSIFICATIONS, FoodTab } from '@/components/FoodClassTabScreen';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { CHEF_ORDERS } from '@/data/mockData'

function FoodList() {
  const router = useRouter()
  const [selectedFoodTab, setSelectedFoodTab] = useState<FoodTab>(FoodTab.All)

  const selectedCategory = FOOD_CLASSIFICATIONS[selectedFoodTab]?.title

  const filteredOrders =
    selectedFoodTab === FoodTab.All
      ? CHEF_ORDERS
      : CHEF_ORDERS.filter((order) => order.category === selectedCategory)

  return (
    <SafeAreaView style={styles.rootContainer}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.goBackTouchableOpacity}
              >
                <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
              </TouchableOpacity>
              <Text style={styles.title}>My Food List</Text>
            </View>
            <FoodClassTabScreen
              selectedFoodTab={selectedFoodTab}
              setSelectedFoodTab={setSelectedFoodTab}
              totalItems={filteredOrders.length}
            />
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items in this category</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <View style={styles.foodImg} />

            <View style={styles.infoContainer}>
              <View style={styles.rowBetween}>
                <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity>
                  <Feather name="more-horizontal" size={22} color="#181C2E" />
                </TouchableOpacity>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.foodCategoryBackground}>
                  <Text style={styles.foodCategory}>{item.category}</Text>
                </View>
                <Text style={styles.foodPrice}>{item.price}</Text>
              </View>

              <View style={styles.ratingRow}>
                <AntDesign name="star" size={16} color="#FB6D3A" />
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.extraInfo}>{item.numberOfRating}</Text>
                <Text style={styles.deliveryMode} numberOfLines={1}>{item.deliveryMode}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 24
  },
  headerContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#181C2E',
  },
  emptyText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#AFAFAF',
    marginTop: 24
  },
  orderContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  foodImg: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#98A8B8',
    marginRight: 14
  },
  infoContainer: {
    flex: 1,
    height: 120,
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  foodName: {
    flex: 1,
    color: '#32343E',
    fontFamily: 'Sen_700Bold',
    fontSize: 15,
    marginRight: 8
  },
  foodPrice: {
    color: '#32343E',
    fontFamily: 'Sen_700Bold',
    fontSize: 16
  },
  foodCategoryBackground: {
    backgroundColor: '#FF762233',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  foodCategory: {
    color: '#FF7622',
    fontFamily: 'Sen_400Regular',
    fontSize: 14
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rating: {
    color: '#FF7622',
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
    marginLeft: 6
  },
  extraInfo: {
    color: '#AFAFAF',
    fontFamily: 'Sen_400Regular',
    fontSize: 11,
    marginLeft: 8
  },
  deliveryMode: {
    color: '#AFAFAF',
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    marginLeft: 'auto'
  }
})

export default FoodList