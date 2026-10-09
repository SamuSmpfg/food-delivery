import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth, useSignUp } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';

export default function AcceptInvitation() {
  const { __clerk_ticket: ticket } = useLocalSearchParams<{
    __clerk_ticket?: string;
  }>();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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

  if (isSignedIn) return <Redirect href="/" />;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/onBoarding');
  };

  const onSubmit = async () => {
    if (!isLoaded || loading || !ticket) return;

    setSubmitted(true);

    if (!password) {
      setError('Please, fill up all the fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.create({
        strategy: 'ticket',
        ticket,
        password,
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        setError(
          `Incomplete registration. Missing fields: ${result.missingFields.join(', ')}`
        );
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ?? 'Unable to complete registration.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Animated.Image
            source={require("../../assets/images/login-gray-rays.png")}
            resizeMode="contain"
            style={[styles.raysGray, { opacity: grayOpacity, transform: [{ scale: grayScale }] }]}
          />
          <Animated.Image
            source={require("../../assets/images/dashed-gray.png")}
            resizeMode="contain"
            style={[styles.dashedGray, { opacity: dashedOpacity, transform: [{ scale: dashedScale }] }]}
          />

          <TouchableOpacity
            onPress={goBack}
            style={styles.goBackTouchableOpacity}
          >
            <MaterialIcons name="keyboard-arrow-left" size={28} color="#5E616F" />
          </TouchableOpacity>

          <Text style={styles.mainContainerTitle}>{ticket ? 'Welcome, Chef!' : 'Invalid invitation'}</Text>
          <Text style={styles.mainContainerText}>
            {ticket ? 'Create your password to complete the registration' : 'This invitation link is not valid'}
          </Text>
        </View>

        <ScrollView
          style={styles.logInSpace}
          contentContainerStyle={styles.logInSpaceContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!ticket ? (
            <View style={styles.inputWrapper}>
              <Text style={styles.infoText}>
                Open the link you received via email to accept the invitation.
              </Text>

              <TouchableOpacity
                style={styles.sendCodeTouchableOpacity}
                onPress={goBack}
                activeOpacity={0.8}
              >
                <Text style={styles.sendCodeTouchableOpacityText}>GO BACK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <Text style={styles.infoText}>
                  Your email has already been confirmed via the invitation.
                </Text>

                <Text style={styles.inputLabel}>NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#A0A5BA"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  textContentType="givenName"
                />

                <Text style={styles.inputLabel}>SURNAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#A0A5BA"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  textContentType="familyName"
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
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.sendCodeTouchableOpacity, loading && styles.sendCodeDisabled]}
                onPress={onSubmit}
                disabled={loading || !isLoaded}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendCodeTouchableOpacityText}>CREATE ACCOUNT</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121223',
  },
  content: {
    flex: 1,
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
    textAlign: 'center'
  },
  headerContainer: {
    height: 250,
    backgroundColor: '#121223',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  goBackTouchableOpacity: {
    backgroundColor: '#fff',
    height: 45,
    width: 45,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: "auto",
    marginBottom: 24
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
  infoText: {
    fontFamily: "Sen_400Regular",
    color: '#32343E',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 32
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