import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'expo-router';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';

const SignUp = () => {
  const { signUp, isLoaded } = useSignUp();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const nameMissing = submitted && !name.trim();
  const emailMissing = submitted && !emailAddress.trim();
  const passwordMissing = submitted && !password;
  const confirmMissing = submitted && !confirmPassword;

  const grayScale = useRef(new Animated.Value(0.8)).current;
  const dashedScale = useRef(new Animated.Value(0.8)).current;
  const grayOpacity = useRef(new Animated.Value(0)).current;
  const dashedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(grayScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.spring(dashedScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(grayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(dashedOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

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
        <Animated.Image
          source={require("../../../assets/images/login-gray-rays.png")}
          resizeMode="contain"
          style={[styles.raysGray, { opacity: grayOpacity, transform: [{ scale: grayScale }] }]}
        />
        <Animated.Image
          source={require("../../../assets/images/dashed-gray.png")}
          resizeMode="contain"
          style={[styles.dashedGray, { opacity: dashedOpacity, transform: [{ scale: dashedScale }] }]}
        />
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
          <View style={styles.inputInPass}>
            <TextInput
              style={[styles.input, styles.inputPassword, passwordMissing && styles.inputError]}
              placeholder="* * * * * * * * * * "
              placeholderTextColor="#A0A5BA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#B4B9CA"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>RE-TYPE PASSWORD</Text>
          <View style={styles.inputInPass}>
            <TextInput
              style={[styles.input, styles.inputPassword, confirmMissing && styles.inputError]}
              placeholder=" * * * * * * * * * *"
              placeholderTextColor="#A0A5BA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#B4B9CA"
              />
            </TouchableOpacity>
          </View>
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
  inputInPass: {
    position: 'relative',
    justifyContent: 'center'
  },
  inputPassword: {
    paddingRight: 52
  },
  eye: {
    position: 'absolute',
    right: 0,
    top: 10,
    width: 52,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center'
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
  },
  raysGray: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 150,
    height: 160,
  },
  dashedGray: {
    position: "absolute",
    top: 40,
    right: -10,
    width: 90,
    height: 300,
  }
});

export default SignUp;