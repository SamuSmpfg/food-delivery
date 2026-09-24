import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontFamily: 'Sen_700Bold',
    fontSize: 24,
    color: '#32343E'
  }
})

export default HomeScreen