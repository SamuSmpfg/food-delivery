import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

type Props = {}

const Profile = (props: Props) => {

  const router = useRouter()
      const { signOut } = useAuth();

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
    <>
    <ScrollView style={{ flex: 1, backgroundColor: '#fff'}}>
    <SafeAreaView style={styles.orangeHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 24}}>
        <TouchableOpacity
            style={styles.goBackTouchableOpacity}
            onPress={() => router.back()}
          >
            <MaterialIcons name="keyboard-arrow-left" size={28} color="#5E616F" />
          </TouchableOpacity>
        <Text style={styles.pageTitle}>My Profile</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.avaliableBalanceText}>Available Balance</Text>
        <Text style={styles.balanceText}>$500.00</Text>

        <TouchableOpacity style={styles.withdrawTouchableOpacity} onPress={() => router.push('/(chef)/(tabs)/(profile)/SucessfulWithdraw')}>
        <Text style={styles.pageTitle}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  
  <View style={styles.infoContainer}>
<View style={styles.personalInfoContainer}>
                <TouchableOpacity>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="user" size={24} color="#FB6F3D" />
                        </View>
                        <Text style={styles.iconsLabels}>Personal Info</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="settings" size={24} color="#413DFB" />
                        </View>
                        <Text style={styles.iconsLabels}>Settings</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.personalInfoContainer}>
                <TouchableOpacity>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <MaterialCommunityIcons name="hand-coin-outline" size={24} color="#FF7622" />
                        </View>
                        <Text style={styles.iconsLabels}>Withdraw History</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Ionicons name="receipt-outline" size={24} color="#18CFE8" />
                        </View>
                        <Text style={styles.iconsLabels}>Number of Orders</Text>
                        <View style={styles.detailsArrow}>
                            <Text style={styles.numberOfOrders}>29K</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

              <View style={styles.personalInfoContainer}>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(chef)/(tabs)/(profile)/Reviews', 
                    params: { type: 'mine' }, })}>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="command" size={24} color="#2AE1E1" />
                        </View>
                        <Text style={styles.iconsLabels}>User Reviews</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>
                </View>

              <View style={styles.personalInfoContainer}>
                <TouchableOpacity onPress={handleSignOut}>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="download" size={24} color="#D20F0F" />
                        </View>
                        <Text style={styles.iconsLabels}>Log Out</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>
                </View>

            </View>
            </ScrollView>
      </>
  )
}

const styles = StyleSheet.create({
  orangeHeader: {
    backgroundColor: '#FF6B00',
    width: 'auto',
    height: 300,
    borderRadius: 20,
  },
  pageTitle: {
    color: '#fff',
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
  },
    goBackTouchableOpacity: {
    backgroundColor: '#fff',
    height: 45,
    width: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  avaliableBalanceText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 16,
    color: '#fff',
  },
  balanceText: {
    fontFamily: 'Sen_700Bold',
    fontSize: 36,
    color: '#fff',
  },
  withdrawTouchableOpacity: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 10,
  },
  infoContainer: { 
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 30
  },
      personalInfoContainer: {
        backgroundColor: '#F6F8FA',
        borderRadius: 16,
        width: 'auto',
        height: 'auto',
        padding: 16,
        marginTop: 24,
        gap: 16,
        justifyContent: 'center',
    },
        infosTouchableOpacity: {
        flexDirection: 'row',
        alignItems: 'center',
    },
        icons: {
        backgroundColor: '#fff',
        width: 50,
        height: 50,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
        iconsLabels: {
        fontFamily: 'Sen_400Regular',
        fontSize: 16,
        color: '#32343E',
    },
    detailsArrow: {
        marginLeft: 'auto',
    },
    numberOfOrders: {
        color: '#9C9BA6',
        fontFamily: 'Sen_700Bold',
        fontSize: 17
    }
})

export default Profile