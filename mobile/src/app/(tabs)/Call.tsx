import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router'

const Call = () => {

    const router = useRouter()

  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.callContainer}>
            <View >
                <View style={styles.avatarContainer}>
                <View style={styles.avatar}></View>
                <Text style={styles.name}>Robert Fox</Text>
                <Text style={styles.status}>Connecting...</Text>
                </View>

                <View style={styles.callTouchableOpacityContainer}>
                    <TouchableOpacity style={styles.muteTouchableOpacity}>
                        <AntDesign name="audio-muted" size={28} color="#181C2E" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    style={styles.hangUpTouchableOpacity}
                    onPress={() => router.back()}>
                        <Feather name="phone" size={38} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    style={styles.muteTouchableOpacity}
                    >
                        <Feather name="volume-1" size={32} color="#181C2E" />
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4C6276',
        justifyContent: 'flex-end'
    },
    callContainer: {
        backgroundColor: '#fff',
        width: '100%',
        minHeight: 420,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 32
    },
    avatarContainer: {
        alignItems: 'center',
        gap: 12
    },
    avatar: {
        backgroundColor: '#98A8B8',
        width: 105,
        height: 105,
        borderRadius: 100,
        alignSelf: 'center',
    },
    name: {
        fontFamily: 'Sen_700Bold',
        fontSize: 20,
        color: '#181C2E'
    },
    status: {
        fontFamily: 'Sen_400Regular',
        fontSize: 16,
        color: '#979797'
    },
    callTouchableOpacityContainer: {
        justifyContent: 'center',
        marginTop: 48,
        flexDirection: 'row',
        gap: 32
    },
    muteTouchableOpacity: {
        backgroundColor: '#ECF0F4',
        borderRadius: 100,
        width: 58,
        height: 58,
        alignItems: 'center',
        justifyContent: 'center'
    },
    hangUpTouchableOpacity: {
        backgroundColor: '#FF3434',
        borderRadius: 100,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        top: -22,
        shadowColor: '#FF3434',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    }
})

export default Call