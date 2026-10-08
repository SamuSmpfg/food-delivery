import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUser } from '@clerk/clerk-expo';
import { useAccountAddress } from '../../../hooks/useAccountAddress';


const PersonalInfo = () => {

    const router = useRouter();
    const { user } = useUser();
    const { address, loading } = useAccountAddress();

    const firstName = user?.firstName ?? '';
    const email = user?.primaryEmailAddress?.emailAddress ?? '';
    const phoneNumber = (user?.unsafeMetadata?.phoneNumber as string) ?? '';
    const bio = (user?.unsafeMetadata?.bio as string) ?? '';

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

                <TouchableOpacity 
                style={styles.editTouchableOpacity}
                onPress={() => router.push('/(tabs)/EditProfile')}
                >
                    <Text style={styles.editTouchableOpacityText}>EDIT</Text>
                </TouchableOpacity>

            </View>

            <View style={styles.userContainer}>
                {user?.hasImage ? (
                    <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatar} />
                )}

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{firstName}</Text>
                    <Text style={styles.description}>{bio || 'No bio yet'}</Text>
                </View>
            </View>

            <View style={styles.personalInfoContainer}>
                <View>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="user" size={24} color="#FB6F3D" />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.iconsLabels}>FIRST NAME</Text>
                            <Text style={styles.description}>{firstName}</Text>
                        </View>
                        <View style={styles.detailsArrow}>
                        </View>
                    </View>
                </View>

                <View>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <MaterialCommunityIcons name="email-outline" size={24} color="#413DFB" />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.iconsLabels}>EMAIL</Text>
                            <Text style={styles.description}>{email}</Text>
                        </View>
                        <View style={styles.detailsArrow}>
                        </View>
                    </View>
                </View>

                <View>
                    <View style={styles.infosTouchableOpacity}>
                        <View style={styles.icons}>
                            <Feather name="phone" size={24} color="#369BFF" />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.iconsLabels}>PHONE NUMBER</Text>
                            <Text style={styles.description}>{phoneNumber || 'No phone saved'}</Text>
                        </View>
                        <View style={styles.detailsArrow}>
                        </View>
                    </View>
                </View>
                <View>
                </View>
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
    editTouchableOpacity: {
        marginLeft: 'auto',
    },
    editTouchableOpacityText: {
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#FF7622',
        textAlign: 'center',
        marginLeft: 'auto',
        textDecorationLine: 'underline'
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
        flex: 1,
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
        fontSize: 14,
        color: '#32343E',
        marginBottom: -10
    },
    detailsArrow: {
        marginLeft: 'auto',
    },
    infoContainer: {
        flexDirection: 'column',
        flex: 1,
    }
})

export default PersonalInfo