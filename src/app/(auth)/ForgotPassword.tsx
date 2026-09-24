import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'expo-router';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';

const RESEND_SECONDS = 30;

const ForgotPassword = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

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

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const getErrorMessage = (err: any, fallback: string) =>
    err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || fallback;

  const onSendCodePress = async () => {
    if (!isLoaded || loading) return;

    if (!emailAddress.trim()) {
      setError('Type your Email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignedIn) {
        await signOut();
      }

      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress.trim(),
      });
      setStep('reset');
      setCooldown(RESEND_SECONDS);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Error sending the code'));
    } finally {
      setLoading(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded || loading || cooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress.trim(),
      });
      setCode('');
      setCooldown(RESEND_SECONDS);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Error sending the code'));
    } finally {
      setLoading(false);
    }
  };

  const onResetPress = async () => {
    if (!isLoaded || loading) return;

    if (code.length < 6 || !password || !confirmPassword) {
      setError('Fill up all the fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/HomeScreen');
      } else {
        setError('The reset could not be completed.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Invalid code'));
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
        <Text style={styles.mainContainerTitle}>Forgot Password</Text>
        <Text style={styles.mainContainerText}>
          {step === 'email'
            ? 'Enter your email to receive a code'
            : 'Enter the code and your new password'}
        </Text>
        {step === 'reset' ? (
          <Text style={styles.mainContainerTextEmail}>{emailAddress.trim()}</Text>
        ) : null}
      </View>

      <ScrollView
        style={styles.logInSpace}
        contentContainerStyle={styles.logInSpaceContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'email' ? (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
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
        ) : (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CODE</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#A0A5BA"
              value={code}
              onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
            />

            <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>NEW PASSWORD</Text>
            <View style={styles.inputInPass}>
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="* * * * * * * * * *"
                placeholderTextColor="#A0A5BA"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
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

            <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>RE-TYPE PASSWORD</Text>
            <View style={styles.inputInPass}>
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="* * * * * * * * * *"
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
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.sendCodeTouchableOpacity, loading && styles.sendCodeDisabled]}
          onPress={step === 'email' ? onSendCodePress : onResetPress}
          disabled={loading || !isLoaded}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendCodeTouchableOpacityText}>
              {step === 'email' ? 'SEND CODE' : 'RESET PASSWORD'}
            </Text>
          )}
        </TouchableOpacity>

        {step === 'reset' ? (
          <View>
            <TouchableOpacity
              onPress={onResendPress}
              disabled={loading || cooldown > 0}
              activeOpacity={0.8}
            >
              <Text style={[styles.backText, cooldown > 0 && styles.resendTextDisabled]}>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStep('email');
                setCode('');
                setPassword('');
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
                setError('');
                setCooldown(0);
              }}
            >
              <Text style={styles.backText}>Use another email</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
  mainContainerTextEmail: {
    fontFamily: "Sen_700Bold",
    color: "#fff",
    fontSize: 16,
    marginTop: 4
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
  inputLabelSpaced: {
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
    paddingLeft: 16
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
  backText: {
    fontFamily: "Sen_400Regular",
    color: '#FF7622',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24
  },
  resendTextDisabled: {
    color: '#A0A5BA'
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

export default ForgotPassword;