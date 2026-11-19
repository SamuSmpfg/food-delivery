import FoodClassTabScreen, { FOOD_CLASSIFICATIONS, FoodTab } from '@/components/FoodClassTabScreen';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo'

type Dish = {
  _id: string
  name: string
  image: string
  classification: string
  deliveryMode: string
  sizes: { label: string; price: number }[]
  rating: number
  reviewsCount: number
}

const API_URL = process.env.EXPO_PUBLIC_API_URL

function FoodList() {
  const router = useRouter()
  const { getToken } = useAuth()

  const [selectedFoodTab, setSelectedFoodTab] = useState<FoodTab>(FoodTab.All)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDishes = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/dishes/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      setDishes(Array.isArray(data) ? data : [])
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar os pratos.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getToken])

  useFocusEffect(
    useCallback(() => {
      loadDishes()
    }, [loadDishes])
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadDishes()
  }

  const openDetails = (id: string) => {
    router.push({ pathname: '/ChefFoodDetails', params: { id } } as any)
  }

  const deleteDish = async (id: string) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/dishes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Erro ${res.status}`)
      }
      setDishes((prev) => prev.filter((d) => d._id !== id))
    } catch (e: any) {
      Alert.alert('Erro ao excluir', e.message ?? 'Tente novamente.')
    }
  }

  const confirmDelete = (dish: Dish) => {
    Alert.alert('Delete item', `Are you sure you want to delete "${dish.name}"?`, [
      { text: 'No, cancel', style: 'cancel' },
      { text: 'Yes, delete', style: 'destructive', onPress: () => deleteDish(dish._id) },
    ])
  }

  const openMenu = (dish: Dish) => {
    Alert.alert(dish.name, undefined, [
      { text: 'Edit', onPress: () => openDetails(dish._id) },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(dish) },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const selectedCategory = FOOD_CLASSIFICATIONS[selectedFoodTab]?.title

  const filteredDishes =
    selectedFoodTab === FoodTab.All
      ? dishes
      : dishes.filter((dish) => dish.classification === selectedCategory)

  if (loading) {
    return (
      <SafeAreaView style={[styles.rootContainer, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#FB6D3A" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
              totalItems={filteredDishes.length}
            />
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items in this category</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.orderContainer}
            onPress={() => openDetails(item._id)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.foodImg} resizeMode="cover" />
            ) : (
              <View style={styles.foodImg} />
            )}

            <View style={styles.infoContainer}>
              <View style={styles.rowBetween}>
                <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity onPress={() => openMenu(item)} hitSlop={12}>
                  <Feather name="more-horizontal" size={22} color="#181C2E" />
                </TouchableOpacity>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.foodCategoryBackground}>
                  <Text style={styles.foodCategory}>{item.classification}</Text>
                </View>
                <Text style={styles.foodPrice}>${item.sizes?.[0]?.price ?? 0}</Text>
              </View>

              <View style={styles.ratingRow}>
                <AntDesign name="star" size={16} color="#FB6D3A" />
                <Text style={styles.rating}>{item.rating ? item.rating.toFixed(1) : '-'}</Text>
                <Text style={styles.extraInfo}>({item.reviewsCount ?? 0} Reviews)</Text>
                <Text style={styles.deliveryMode} numberOfLines={1}>{item.deliveryMode}</Text>
              </View>
            </View>
          </TouchableOpacity>
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