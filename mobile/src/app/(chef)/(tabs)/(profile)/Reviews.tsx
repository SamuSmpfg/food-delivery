import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const REQUEST_TIMEOUT_MS = 10000

type Review = {
  _id: string
  rating: number
  title: string
  description?: string
  createdAt: string
  userId?: { _id: string; name?: string } | null
}

type SearchParams = {
  id?: string
  type?: 'restaurant' | 'dish'
}

type StarsProps = {
  rating: number
}

const Stars = ({ rating }: StarsProps) => {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }).map((_, index) => (
        <FontAwesome
          key={index}
          name={index < Math.round(rating) ? 'star' : 'star-o'}
          size={13}
          color="#FB6D3A"
        />
      ))}
    </View>
  )
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const Reviews = () => {
  console.log(useLocalSearchParams())
  const router = useRouter()
  const { id, type = 'restaurant' } = useLocalSearchParams<SearchParams>()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReviews = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setError('Missing restaurant or dish identifier.')
        setLoading(false)
        return
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const response = await fetch(`${API_URL}/api/reviews/${type}/${id}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Request failed')
        const data: Review[] = await response.json()
        setReviews(data)
      } catch (err) {
        const timedOut = err instanceof Error && err.name === 'AbortError'
        setError(timedOut ? 'The request timed out. Please try again.' : 'Unable to load reviews.')
      } finally {
        clearTimeout(timeout)
        setLoading(false)
        setRefreshing(false)
      }
    },
    [id, type]
  )

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator style={styles.feedback} size="large" color="#FB6D3A" />
    }

    if (error) {
      return (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadReviews()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (reviews.length === 0) {
      return (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>No reviews yet.</Text>
        </View>
      )
    }

    return reviews.map((item) => {
      const authorName = item.userId?.name ?? 'Anonymous'

      return (
        <View key={item._id} style={styles.reviewRow}>
          <View style={styles.profileImg}>
            <Text style={styles.profileInitial}>{authorName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.reviewBox}>
            <View style={styles.reviewHeader}>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <TouchableOpacity>
                <Feather name="more-horizontal" size={24} color="#9C9BA6" />
              </TouchableOpacity>
            </View>
            <Text style={styles.author}>{authorName}</Text>
            <Text style={styles.reviewTitle}>{item.title}</Text>
            <Stars rating={item.rating} />
            {!!item.description && <Text style={styles.comment}>{item.description}</Text>}
          </View>
        </View>
      )
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadReviews(true)}
            tintColor="#FB6D3A"
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.goBackTouchableOpacity}
            onPress={() => router.back()}
          >
            <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
          </TouchableOpacity>
          <Text style={styles.title}>Reviews</Text>
        </View>

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    color: '#181C2E',
    fontFamily: 'Sen_400Regular',
    fontSize: 17,
  },
  goBackTouchableOpacity: {
    backgroundColor: '#ECF0F4',
    height: 45,
    width: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  profileImg: {
    backgroundColor: '#98A8B8',
    width: 50,
    height: 50,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontFamily: 'Sen_700Bold',
    fontSize: 18,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontFamily: 'Sen_400Regular',
    color: '#9C9BA6',
    fontSize: 12,
  },
  author: {
    color: '#181C2E',
    fontFamily: 'Sen_700Bold',
    fontSize: 13,
    marginTop: 2,
  },
  reviewTitle: {
    color: '#32343E',
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  comment: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
  },
  reviewBox: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    borderRadius: 20,
    padding: 16,
  },
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  feedbackText: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#FB6D3A',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#fff',
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
  },
})

export default Reviews