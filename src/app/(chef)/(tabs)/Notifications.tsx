import { useAuth } from '@clerk/clerk-expo';
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Alert } from 'react-native'



export default function ChefHome() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Notifications</Text>
    </View>
  )
}