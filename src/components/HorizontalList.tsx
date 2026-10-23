import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const ITEMS = [
  { id: '1' },
  { id: '2' },
  { id: '3' },
  { id: '4' },
  { id: '5' },
]

const HorizontalList = () => {

  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Items This Weeks</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ITEMS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() =>  <View style={styles.separator} />}
        renderItem={() => <TouchableOpacity 
          style={styles.card} onPress={() => router.navigate('/(chef)/(tabs)/(home)/ChefFoodDetails')}/>}
      />
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
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        color: '#32343E',
        fontSize: 14,
        fontFamily: 'Sen_400Regular'
    },
    seeAll: {
        color: '#FB6D3A',
        fontSize: 14,
        fontFamily: 'Sen_400Regular',
        textDecorationLine: 'underline'
    },
    card: {
        width: 190,
        height: 180,
        borderRadius: 20,
        backgroundColor: '#98A8B8'
    },
    separator: {
        width: 16
    }
})

export default HorizontalList