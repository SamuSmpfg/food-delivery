import { useAuth } from '@clerk/clerk-expo';
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Alert } from 'react-native'



export default function ChefHome() {
  
  const { signOut } = useAuth();
  const router = useRouter()

const handleSignOut = async () => {
        Alert.alert('Sign Out', `Are you sure you want to Sign Out?`, [
          {
            text: 'Yes',
            style: 'destructive',
            onPress: async () => {
                try {
                    await signOut();
                    router.replace('/(auth)/SignIn');
                } catch (error) {
                    console.error('Erro ao sair:', error);
                }
            },
          },
          { text: 'No', style: 'cancel',}
        ])
    };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Painel do Chef</Text>

      <TouchableOpacity
                      onPress={handleSignOut}
                      >
                          <View>
                              <View>
                                  <Feather name="log-out" size={24} color="#FB4A59" />
                              </View>
                              <Text>Log Out</Text>
                              <View>
                                  <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                              </View>
                          </View>
                      </TouchableOpacity>
    </View>
  )
}