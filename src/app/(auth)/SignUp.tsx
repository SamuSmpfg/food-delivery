import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { useSignUp, useAuth } from '@clerk/clerk-expo';

const SignUp = () => {
  const { signUp, isLoaded } = useSignUp();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const nameMissing = submitted && !name.trim();
  const emailMissing = submitted && !emailAddress.trim();
  const passwordMissing = submitted && !password;
  const confirmMissing = submitted && !confirmPassword;

  const onSignUpPress = async () => {
    if (!isLoaded || loading) return;

    setSubmitted(true);

    if (!name.trim() || !emailAddress.trim() || !password || !confirmPassword) {
      setError('Please, fill up all the fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignedIn) {
        await signOut();
      }

      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ');

      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
        firstName,
        lastName: lastName || undefined,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      router.navigate('/(auth)/PasswordVerification');
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Error on creating an account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.mainContainerTitle}>Sign Up</Text>
        <Text style={styles.mainContainerText}>Please sign up to get started</Text>
      </View>

      <ScrollView
        style={styles.logInSpace}
        contentContainerStyle={styles.logInSpaceContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>NAME</Text>
          <TextInput
            style={[styles.input, nameMissing && styles.inputError]}
            placeholder="John Doe"
            placeholderTextColor="#A0A5BA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
          />

          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={[styles.input, emailMissing && styles.inputError]}
            placeholder="example@gmail.com"
            placeholderTextColor="#A0A5BA"
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput
            style={[styles.input, passwordMissing && styles.inputError]}
            placeholder=" * * * * * * * * * *"
            placeholderTextColor="#A0A5BA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />

          <Text style={styles.inputLabel}>RE-TYPE PASSWORD</Text>
          <TextInput
            style={[styles.input, confirmMissing && styles.inputError]}
            placeholder=" * * * * * * * * * *"
            placeholderTextColor="#A0A5BA"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.sendCodeTouchableOpacity, loading && styles.sendCodeDisabled]}
          onPress={onSignUpPress}
          disabled={loading || !isLoaded}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendCodeTouchableOpacityText}>SIGN UP</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121223',
  },
  mainContainerTitle: {
    fontFamily: "Sen_700Bold",
    color: "#fff",
    fontSize: 30,
    marginBottom: 16
  },
  mainContainerText: {
    fontFamily: "Sen_400Regular",
    color: "#fff",
    fontSize: 14,
  },
  headerContainer: {
    height: 250,
    backgroundColor: '#121223',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInSpace: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
  },
  logInSpaceContent: {
    paddingBottom: 48
  },
  inputWrapper: {
    marginBottom: 32
  },
  inputLabel: {
    fontFamily: "Sen_400Regular",
    color: '#32343E',
    marginTop: 32
  },
  input: {
    backgroundColor: "#F0F5FA",
    width: 'auto',
    height: 62,
    marginTop: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  inputError: {
    borderColor: '#E53935'
  },
  errorText: {
    fontFamily: "Sen_400Regular",
    color: '#E53935',
    fontSize: 14,
    marginBottom: 16
  },
  sendCodeTouchableOpacity: {
    width: 'auto',
    height: 62,
    backgroundColor: "#FF7622",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  sendCodeDisabled: {
    opacity: 0.6
  },
  sendCodeTouchableOpacityText: {
    fontFamily: "Sen_700Bold",
    color: "#FFFFFF",
    fontSize: 14,
  }
});

export default SignUp;