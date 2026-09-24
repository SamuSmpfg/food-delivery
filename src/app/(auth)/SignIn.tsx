import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import * as Location from 'expo-location'
import Ionicons from '@expo/vector-icons/Ionicons';

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailMissing = submitted && !emailAddress.trim();
  const passwordMissing = submitted && !password;

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

  const onSignInPress = async () => {
    if (!isLoaded || loading) return;

    setSubmitted(true);

    if (!emailAddress.trim() || !password) {
      setError('Please, fill up all the fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignedIn) {
        await signOut();
      }

      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });

        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === 'granted') {
          router.replace('/(tabs)/HomeScreen');
        } else {
          router.replace('/LocationAcess');
        }
      } else {
        setError('Could not log in, verify your credentials.');
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Error logging in';
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
        <Text style={styles.mainContainerTitle}>LOG IN</Text>
        <Text style={styles.mainContainerText}>Please sign in to your existing account</Text>
      </View>

      <ScrollView
        style={styles.logInSpace}
        contentContainerStyle={styles.logInSpaceContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputWrapper}>
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
        </View>
        <View style={styles.inputWrapper}>
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
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.checkboxWrapper}>
          <Checkbox
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? '#FF7622' : undefined}
          />
          <TouchableOpacity
          onPress={() => setChecked(!isChecked)}
          >
          <Text style={styles.checkboxlabel}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text
              style={styles.textForgotPassword}
              onPress={() => router.navigate('/(auth)/ForgotPassword')}
            >
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginTouchableOpacity, loading && styles.loginDisabled]}
          onPress={onSignInPress}
          disabled={loading || !isLoaded}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginTouchableOpacityText}>LOG IN</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signUpQuestion}>
          <Text style={styles.simpleTexts}>Don’t have an account?</Text>
          <TouchableOpacity>
            <Text style={styles.signUpTouchableOpacity} onPress={() => router.navigate('/(auth)/SignUp')}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.otherSignUpMethods}>
          <Text style={styles.simpleTexts}>Or</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.socialCircle, styles.socialFacebook]}
            >
              <FontAwesome5 name="facebook-f" size={26} color="#FFFFFF" brand />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.socialCircle, styles.socialTwitter]}
            >
              <FontAwesome5 name="twitter" size={26} color="#FFFFFF" brand />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.socialCircle, styles.socialApple]}
            >
              <FontAwesome5 name="apple" size={28} color="#FFFFFF" brand />
            </TouchableOpacity>
          </View>
        </View>
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
    overflow: 'hidden',
  },
  logInSpace: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 30,
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
  errorText: {
    fontFamily: "Sen_400Regular",
    color: '#E53935',
    fontSize: 14,
    marginBottom: 16
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
  checkboxWrapper: {
    flexDirection: 'row'
  },
  checkboxlabel: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: "Sen_400Regular",
    color: "#7E8A97"
  },
  textForgotPassword: {
    color: '#FF7622',
    fontSize: 14,
    fontFamily: "Sen_400Regular",
    marginLeft: 50
  },
  loginTouchableOpacity: {
    width: 'auto',
    height: 62,
    backgroundColor: "#FF7622",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  loginDisabled: {
    opacity: 0.6
  },
  loginTouchableOpacityText: {
    fontFamily: "Sen_700Bold",
    color: "#FFFFFF",
    fontSize: 14,
  },
  signUpQuestion: {
    flexDirection: 'row',
    marginTop: 32,
    justifyContent: 'center'
  },
  simpleTexts: {
    color: "#646982",
    fontFamily: "Sen_400Regular",
    fontSize: 16
  },
  signUpTouchableOpacity: {
    color: '#FF7622',
    fontFamily: "Sen_700Bold",
    marginLeft: 8
  },
  otherSignUpMethods: {
    marginTop: 32,
    alignItems: "center",
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 24
  },
  socialCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center'
  },
  socialFacebook: {
    backgroundColor: "#3F5994",
  },
  socialTwitter: {
    backgroundColor: "#489BE6",
  },
  socialApple: {
    backgroundColor: "#1D2030",
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

export default SignIn;