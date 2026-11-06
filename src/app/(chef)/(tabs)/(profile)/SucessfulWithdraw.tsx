import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import SparkleBurst from '@/components/SparkleBurst'

type Props = {}

const SuccessfulWithdraw = (props: Props) => {

  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.checkWrapper}>
          <SparkleBurst />
          <View style={styles.check}>
            <Feather name="check" size={70} color="white" />
          </View>
        </View>
        <Text style={styles.text}>Withdraw Successful</Text>
        <TouchableOpacity style={styles.okTouchableOpacity} onPress={() => router.back()}>
          <Text style={styles.okTouchableOpacityText}>OK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkWrapper: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 24
  },
  check: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: '#FB6D3A',
    padding: 24
  },
  okTouchableOpacity:{
    width: 'auto',
    height: 72,
    backgroundColor: '#FB6D3A',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okTouchableOpacityText: {
    color: '#fff',
    fontFamily: 'Sen_400Regular',
    fontSize: 18
  },
  text: {
    color: '#333333',
    fontFamily: 'Poppins_500Medium',
    fontSize: 24,
    marginVertical: 32
  }
})

export default SuccessfulWithdraw