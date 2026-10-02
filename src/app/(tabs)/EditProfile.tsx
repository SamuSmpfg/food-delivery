import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather';

const EditProfile = () => {

    const router = useRouter();

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

                <Text style={styles.profile}>Edit Profile</Text>
            </View>

            <View style={styles.avatarContainer}>
                <View style={styles.avatar}/>
                <TouchableOpacity style={styles.editTouchableOpacity}>
                    <Feather name="edit-2" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>FULL NAME</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#6B6E82"
                editable
                inputMode="text"
                />
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>EMAIL</Text>
                <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#6B6E82"
                editable
                inputMode="email"
                />
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>PHONE NUMBER</Text>
                <TextInput
                style={styles.input}
                placeholder="123-456-7890"
                placeholderTextColor="#6B6E82"
                editable
                inputMode="tel"
                />
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>BIO</Text>
                <TextInput
                    style={styles.bioTextInput}
                    placeholder="I love fast food"
                    placeholderTextColor="#6B6E82"
                    editable
                    inputMode="text"
                />
            </View>

            <TouchableOpacity style={styles.saveTouchableOpacity}>
                <Text style={styles.saveTouchableOpacityText}>SAVE</Text>
            </TouchableOpacity>

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
    avatarContainer: {
        marginVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        backgroundColor: '#F8822275',
        width: 150,
        height: 150,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editTouchableOpacity: {
        backgroundColor: '#FF7622',
        width: 45,
        height: 45,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 5,
        right: 95,
    },
    textInputContainer: {
        width: 'auto',
        height: 'auto',
        gap: 8,
        marginBottom: 24,   
    },
    textInputLabel: {
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#32343E',
    },
    input: {
        width: 'auto',
        height: 64,
        borderRadius: 12,
        backgroundColor: '#F0F5FA',
        padding: 16,
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#32343E',
    },
    bioTextInput: {
        width: 'auto',
        height: 120,
        borderRadius: 12,
        backgroundColor: '#F0F5FA',
        padding: 16,
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#32343E',
        alignItems: 'flex-start',
    },
    saveTouchableOpacity: {
        width: 'auto',
        height: 72,
        borderRadius: 20,
        backgroundColor: '#FF7622',
    },
    saveTouchableOpacityText: {
        fontFamily: 'Sen_700Bold',
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        alignItems: 'center',
        padding: 24,
    }
})

export default EditProfile