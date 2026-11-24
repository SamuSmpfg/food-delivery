import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'

const API_URL = process.env.EXPO_PUBLIC_API_URL
const REQUEST_TIMEOUT_MS = 10000

type DishOption = {
  dishId: string
  name: string
}

type SearchParams = {
  orderId?: string | string[]
  items?: string | string[]
}

const first = <T,>(value?: T | T[]) => (Array.isArray(value) ? value[0] : value)

const WriteReview = () => {
  const router = useRouter()
  const params = useLocalSearchParams<SearchParams>()
  const orderId = first(params.orderId)
  const rawItems = first(params.items)

  const { getToken } = useAuth()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const dishes = useMemo<DishOption[]>(() => {
    try {
      const parsed: { dishId: string; name: string }[] = JSON.parse(rawItems ?? '[]')
      const seen = new Set<string>()
      const list: DishOption[] = []
      parsed.forEach((item) => {
        const key = String(item.dishId)
        if (!seen.has(key)) {
          seen.add(key)
          list.push({ dishId: key, name: item.name })
        }
      })
      return list
    } catch {
      return []
    }
  }, [rawItems])

  const [selectedDishId, setSelectedDishId] = useState<string | null>(dishes[0]?.dishId ?? null)
  const [reviewedIds, setReviewedIds] = useState<string[]>([])
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = !!selectedDishId && rating > 0 && title.trim().length > 0 && !submitting

  const resetForm = () => {
    setRating(0)
    setTitle('')
    setDescription('')
  }

  const finishReview = (dishId: string) => {
    const nextReviewed = [...reviewedIds, dishId]
    setReviewedIds(nextReviewed)
    resetForm()

    const next = dishes.find((dish) => !nextReviewed.includes(dish.dishId))
    if (next) {
      setSelectedDishId(next.dishId)
      return
    }
    router.back()
  }

  const handleSubmit = async () => {
    if (!canSubmit || !selectedDishId) return

    if (!API_URL) {
      Alert.alert('Error', 'EXPO_PUBLIC_API_URL is not set.')
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    setSubmitting(true)

    try {
      const token = await getTokenRef.current()
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          dishId: selectedDishId,
          rating,
          title: title.trim(),
          description: description.trim(),
        }),
        signal: controller.signal,
      })

      if (response.status === 409) {
        Alert.alert('Already reviewed', 'You already reviewed this dish for this order.')
        finishReview(selectedDishId)
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        Alert.alert('Error', data?.message ?? 'Could not send your review.')
        return
      }

      Alert.alert('Thank you!', 'Your review was sent to the chef.')
      finishReview(selectedDishId)
    } catch (err) {
      const timedOut = err instanceof Error && err.name === 'AbortError'
      Alert.alert('Error', timedOut ? 'The request timed out. Please try again.' : 'Could not send your review.')
    } finally {
      clearTimeout(timeout)
      setSubmitting(false)
    }
  }

  const renderDishes = () => {
    if (dishes.length === 0) {
      return <Text style={styles.emptyText}>No dishes found in this order.</Text>
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dishList}>
        {dishes.map((dish) => {
          const reviewed = reviewedIds.includes(dish.dishId)
          const selected = selectedDishId === dish.dishId

          return (
            <TouchableOpacity
              key={dish.dishId}
              disabled={reviewed}
              onPress={() => setSelectedDishId(dish.dishId)}
              style={[
                styles.dishChip,
                selected && styles.dishChipSelected,
                reviewed && styles.dishChipReviewed,
              ]}
            >
              <Text style={[styles.dishChipText, selected && styles.dishChipTextSelected]} numberOfLines={1}>
                {dish.name}
              </Text>
              {reviewed && <Text style={styles.reviewedLabel}>Reviewed</Text>}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.goBackTouchableOpacity} onPress={() => router.back()}>
              <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
            </TouchableOpacity>
            <Text style={styles.title}>Write a Review</Text>
          </View>

          <Text style={styles.label}>WHICH DISH?</Text>
          {renderDishes()}

          <Text style={styles.label}>YOUR RATING</Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, index) => (
              <TouchableOpacity key={index} onPress={() => setRating(index + 1)} hitSlop={6}>
                <FontAwesome
                  name={index < rating ? 'star' : 'star-o'}
                  size={36}
                  color="#FB6D3A"
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>TITLE</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            placeholder="Great Food and Service"
            placeholderTextColor="#A0A5BA"
          />

          <Text style={styles.label}>COMMENT</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            maxLength={500}
            multiline
            textAlignVertical="top"
            placeholder="Tell the chef what you thought..."
            placeholderTextColor="#A0A5BA"
          />
          <Text style={styles.counter}>{description.length}/500</Text>

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            disabled={!canSubmit}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Send Review</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  label: {
    color: '#32343E',
    fontFamily: 'Sen_400Regular',
    fontSize: 13,
    marginTop: 28,
    marginBottom: 12,
  },
  dishList: {
    gap: 8,
  },
  dishChip: {
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 220,
  },
  dishChipSelected: {
    borderColor: '#FF7622',
    backgroundColor: '#FFF3EC',
  },
  dishChipReviewed: {
    opacity: 0.5,
  },
  dishChipText: {
    color: '#181C2E',
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
  },
  dishChipTextSelected: {
    color: '#FF7622',
  },
  reviewedLabel: {
    color: '#059C6A',
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
  },
  stars: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    color: '#32343E',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
  },
  textArea: {
    height: 130,
    paddingTop: 14,
  },
  counter: {
    color: '#9C9BA6',
    fontFamily: 'Sen_400Regular',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: '#FF7622',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
  },
})

export default WriteReview