import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import AntDesign from '@expo/vector-icons/AntDesign'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const POPULAR_PATH = '/api/dishes/popular'

type PopularDish = {
  _id: string
  name: string
  image?: string | null
  sizes?: { label: string; price: number }[]
  rating?: number
}

const HorizontalList = () => {
  const router = useRouter()
  const { getToken } = useAuth()
  const [items, setItems] = useState<PopularDish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}${POPULAR_PATH}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error(String(response.status))
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
      setError(false)
   } catch (e) {
  console.warn('popular items:', e)
  setError(true)
} finally {
      setLoading(false)
    }
  }, [getToken])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const renderContent = () => {
    if (error) return <Text style={styles.feedbackText}>Could not load items</Text>
    if (items.length === 0) return <Text style={styles.feedbackText}>No popular items yet</Text>

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.card}
            onPress={() =>
              router.navigate({
                pathname: '/(chef)/(tabs)/(home)/ChefFoodDetails',
                params: { id: item._id },
              })
            }
          >
            {!!item.image && (
              <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            )}
          </TouchableOpacity>
        )}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Items This Weeks</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#32343E',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
  },
  seeAll: {
    color: '#FB6D3A',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
    textDecorationLine: 'underline',
  },
  card: {
    width: 190,
    height: 180,
    borderRadius: 20,
    backgroundColor: '#98A8B8',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginRight: 8
  },
  feedbackText: {
    height: 180,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#9C9BA6',
    fontSize: 14,
    fontFamily: 'Sen_400Regular',
  },
})

export default HorizontalList