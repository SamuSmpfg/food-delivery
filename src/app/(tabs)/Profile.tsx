import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Profile = () => {

    const router = useRouter();
    const { signOut } = useAuth();
    const { user } = useUser();

    const firstName = user?.firstName ?? '';
    const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <ScrollView style={styles.scrollViewContainer}>
        <SafeAreaView>
            <View style={styles.headerContainer}>
                <TouchableOpacity 
                style={styles.goBackTouchableOpacity}
                onPress={() => router.back()}
                >
                    <View>
                        <MaterialIcons name="keyboard-arrow-left" size={28} color="#181C2E" />
                    </View>
                </TouchableOpacity>

                <Text style={styles.profile}>Profile</Text>

                <View style={styles.extra}>
                <TouchableOpacity style={styles.extraTouchableOpacity}>
                    <Text style={styles.extraTouchableOpacityText}>...</Text>
                </TouchableOpacity>
                </View>

            </View>

            <View style={styles.userContainer}>
                {user?.hasImage ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatar} />
                )}

                <View style={styles.userInfo}>
                <Text style={styles.userName}>{firstName}</Text>
                <Text style={styles.description}>{email}</Text>
                </View>
            </View>

            <View style={styles.personalInfoContainer}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/PersonalInfo')}>
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

                 <TouchableOpacity onPress={() => router.push('/(tabs)/Adresses')}>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="map" size={24} color="#413DFB" />
                        </View>
                        <Text style={styles.iconsLabels}>Addresses</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>


             <View style={styles.personalInfoContainer}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')}>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="shopping-bag" size={24} color="#369BFF" />
                        </View>
                        <Text style={styles.iconsLabels}>Cart</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Entypo name="heart-outlined" size={24} color="#B33DFB" />
                        </View>
                        <Text style={styles.iconsLabels}>Favourite</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => router.push('/(tabs)/MyOrders')}
                >
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <MaterialCommunityIcons name="food-outline" size={24} color="#413DFB" />
                        </View>
                        <Text style={styles.iconsLabels}>My Orders</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="bell" size={24} color="#FFAA2A" />
                        </View>
                        <Text style={styles.iconsLabels}>Notifications</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity onPress={() => router.push('/(tabs)/Payment')}>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="credit-card" size={24} color="#369BFF" />
                        </View>
                        <Text style={styles.iconsLabels}>Payment Methods</Text>
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
                            <AntDesign name="question-circle" size={24} color="#FB6D3A" />
                        </View>
                        <Text style={styles.iconsLabels}>FAQs</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>

                 <TouchableOpacity>
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
                <TouchableOpacity
                onPress={() => signOut()}
                >
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="log-out" size={24} color="#FB4A59" />
                        </View>
                        <Text style={styles.iconsLabels}>Log Out</Text>
                        <View style={styles.detailsArrow}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#747783" />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24
    },
    headerContainer:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    extra: {
        marginLeft: 'auto',
    },
    goBackTouchableOpacity: {
        backgroundColor: '#ECF0F4',
        width: 45,
        height: 45,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profile: {
        fontFamily: 'Sen_400Regular',
        fontSize: 17,
        marginLeft: 16,
        color: '#181C2E'
    },
    extraTouchableOpacity: {
        backgroundColor: '#ECF0F4',
        width: 45,
        height: 45,
        borderRadius: 100,
    },
    extraTouchableOpacityText: {
        fontFamily: 'Sen_800ExtraBold',
        fontSize: 20,
        color: '#181C2E',
        textAlign: 'center',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    avatar: {
        backgroundColor: '#F8822275',
        width: 100,
        height: 100,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'column',
        marginLeft: 16,
    },
    userName: {
        fontFamily: 'Sen_700Bold',
        fontSize: 20,
        color: '#32343E'
    },
    description: {
        fontFamily: 'Sen_400Regular',
        fontSize: 12,
        color: '#A0A5BA',
        marginTop: 10
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
    }
})

export default Profile