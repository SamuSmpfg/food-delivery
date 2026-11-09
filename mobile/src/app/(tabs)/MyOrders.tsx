import { ScrollView, View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import TabScreen from '../../components/TabScreen'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const MyOrders = () => {

  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
         <View style={styles.headerContainer}>
              <TouchableOpacity 
              style={styles.backTouchableOpacity}
              onPress={() => router.back()}
              >
                <MaterialIcons name="keyboard-arrow-left" size={32} color="#181C2E" />
              </TouchableOpacity>
        
              <Text style={styles.pageTouchableOpacityLabels}>My Orders</Text>
        
              <TouchableOpacity style={styles.moreTouchableOpacity}>
                <Feather name="more-horizontal" size={22} color="#181C2E" />
              </TouchableOpacity>
              </View>
        <TabScreen />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backTouchableOpacity: {
    height: 55,
    width: 55,
    borderRadius: 100,
    backgroundColor: '#ECF0F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreTouchableOpacity: {
    height: 55,
    width: 55,
    borderRadius: 100,
    backgroundColor: '#ECF0F4',
    alignItems: 'center',
    justifyContent: 'center', 
    marginLeft: 'auto'
  },
  pageTouchableOpacityLabels: {
    fontFamily: 'Sen_400Regular',
    marginLeft: 16,
    fontSize: 16,
    color: '#181C2E'
  }
})

export default MyOrders