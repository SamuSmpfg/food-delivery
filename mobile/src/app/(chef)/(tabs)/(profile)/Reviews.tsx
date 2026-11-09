import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { REVIEWS } from '@/data/mockData'

type Props = {}

type StarsProps = {
  rating: number
}

const Stars = ({ rating }: StarsProps) => {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }).map((_, index) => (
        <FontAwesome
          key={index}
          name={index < rating ? 'star' : 'star-o'}
          size={13}
          color="#FB6D3A"
        />
      ))}
    </View>
  )
}

const Reviews = (props: Props) => {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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

        {REVIEWS.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            <View style={styles.profileImg} />
            <View style={styles.reviewBox}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.date}>{item.date}</Text>
              <TouchableOpacity>
              <Feather name="more-horizontal" size={24} color="#9C9BA6" />
              </TouchableOpacity>
              </View>
              <Text style={styles.reviewTitle}>{item.title}</Text>
              <Stars rating={item.rating} />
              <Text style={styles.comment}>{item.comment}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  title: {
    color: '#181C2E',
    fontFamily: 'Sen_400Regular',
    fontSize: 17
  },
  goBackTouchableOpacity: {
    backgroundColor: '#ECF0F4',
    height: 45,
    width: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    backgroundColor: '#98A8B8',
    width: 50,
    height: 50,
    borderRadius: 100
  },
  date: {
    fontFamily: 'Sen_400Regular',
    color: '#9C9BA6',
    fontSize: 12
  },
  reviewTitle: {
    color: '#32343E',
    fontFamily: 'Sen_700Bold',
    fontSize: 14
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4
  },
  comment: {
    color: '#747783',
    fontFamily: 'Sen_400Regular',
    fontSize: 12
  },
  reviewBox: {
    width: 286,
    height: 'auto',
    backgroundColor: '#F6F8FA',
    borderRadius: 20,
    padding: 16
  }
})

export default Reviews