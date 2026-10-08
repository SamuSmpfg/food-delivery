import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather';
import { useUser } from '@clerk/clerk-expo';
import { useProfileImagePicker } from '../../../hooks/useProfileImagePicker';

const EditProfile = () => {

    const router = useRouter();
    const { user } = useUser();
    const { pickImage, uploading } = useProfileImagePicker();

    const [firstName, setFirstName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bio, setBio] = useState('');
    const [saving, setSaving] = useState(false);

    const email = user?.primaryEmailAddress?.emailAddress ?? '';

    // Preenche os campos quando o usuário carregar
    useEffect(() => {
        if (!user) return;
        setFirstName(user.firstName ?? '');
        setPhoneNumber((user.unsafeMetadata?.phoneNumber as string) ?? '');
        setBio((user.unsafeMetadata?.bio as string) ?? '');
    }, [user?.id]);

    const handleSave = async () => {
        if (!user || saving) return;

        if (!firstName.trim()) {
            Alert.alert('Warning', 'The name can not be empty.');
            return;
        }

        try {
            setSaving(true);
            await user.update({
                firstName: firstName.trim(),
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    phoneNumber: phoneNumber.trim(),
                    bio: bio.trim(),
                },
            });
            router.back();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not save, try again.');
        } finally {
            setSaving(false);
        }
    };

  return (
        <KeyboardAvoidingView
        style={styles.scrollViewContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
    <ScrollView >
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
                <View>
                    {user?.hasImage ? (
                        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatar} />
                    )}

                    {uploading && (
                        <View style={styles.avatarLoading}>
                            <ActivityIndicator color="#FFFFFF" />
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.editTouchableOpacity}
                        onPress={pickImage}
                        disabled={uploading}
                    >
                        <Feather name="edit-2" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>FIRST NAME</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#6B6E82"
                value={firstName}
                onChangeText={setFirstName}
                inputMode="text"
                />
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>EMAIL</Text>
                <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                editable={false}
                inputMode="email"
                />
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>PHONE NUMBER</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#6B6E82"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                inputMode="tel"
                />
            </View>

            <View style={styles.textInputContainer}>
                <Text style={styles.textInputLabel}>BIO</Text>
                <TextInput
                    style={styles.bioTextInput}
                    placeholder="I love fast food"
                    placeholderTextColor="#6B6E82"
                    value={bio}
                    onChangeText={setBio}
                    inputMode="text"
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <TouchableOpacity
                style={[styles.saveTouchableOpacity, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#FFFFFF" style={{ padding: 24 }} />
                ) : (
                    <Text style={styles.saveTouchableOpacityText}>SAVE</Text>
                )}
            </TouchableOpacity>

      </SafeAreaView>
    </ScrollView>
        </KeyboardAvoidingView>
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
    avatarLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 100,
        backgroundColor: 'rgba(0,0,0,0.35)',
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
        bottom: 0,
        right: 0,
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
        justifyContent: 'flex-start'
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
    },
    inputDisabled: {
        opacity: 0.6,
    }
})

export default EditProfile