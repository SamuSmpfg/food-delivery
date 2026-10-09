import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ChefApplication() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const nameMissing = submitted && !name.trim();
  const emailMissing = submitted && !email.trim();
  const restaurantMissing = submitted && !restaurantName.trim();
  const phoneMissing = submitted && !phone.trim();

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

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/onBoarding');
  };

  const sendApplication = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/chef-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, restaurantName, phone }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.message ?? 'It was not possible to submit the application.');
        return false;
      }

      return true;
    } catch {
      setError('No connection to the server. Try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (loading) return;

    setSubmitted(true);

    if (!name.trim() || !email.trim() || !restaurantName.trim() || !phone.trim()) {
      setError('Fill in all the fields.');
      return;
    }

    const ok = await sendApplication();
    if (ok) setSent(true);
  };

  const onResend = async () => {
    if (loading) return;

    setResent(false);
    const ok = await sendApplication();
    if (ok) setResent(true);
  };

  const onEditDetails = () => {
    if (loading) return;

    setSent(false);
    setResent(false);
    setError(null);
    setSubmitted(false);
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

          <Text style={styles.mainContainerTitle}>{sent ? 'Invitation sent!' : 'Chef Application'}</Text>
          <Text style={styles.mainContainerText}>
            {sent ? 'Check your email to continue' : 'Tell us a little about yourself and your restaurant.'}
          </Text>
        </View>

        <ScrollView
          style={styles.logInSpace}
          contentContainerStyle={styles.logInSpaceContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sent ? (
            <View style={styles.inputWrapper}>
              <Text style={styles.sentText}>
                We’ve sent an invitation to your email. Open the link to create your chef account.
                If you don't see it, check your spam folder.
              </Text>

              {resent ? <Text style={styles.resentText}>Invitation sent again!</Text> : null}
              {error ? <Text style={styles.sentErrorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.resendTouchableOpacity, loading && styles.sendCodeDisabled]}
                onPress={onResend}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FF7622" />
                ) : (
                  <Text style={styles.resendTouchableOpacityText}>RESEND INVITATION</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.link} onPress={onEditDetails} disabled={loading}>
                <Text style={styles.linkText}>Use another email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendCodeTouchableOpacity}
                onPress={goBack}
                activeOpacity={0.8}
              >
                <Text style={styles.sendCodeTouchableOpacityText}>VOLTAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />

                <Text style={styles.inputLabel}>RESTAURANT NAME</Text>
                <TextInput
                  style={[styles.input, restaurantMissing && styles.inputError]}
                  placeholder="My Restaurant"
                  placeholderTextColor="#A0A5BA"
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                  autoCapitalize="words"
                />

                <Text style={styles.inputLabel}>PHONE</Text>
                <TextInput
                  style={[styles.input, phoneMissing && styles.inputError]}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#A0A5BA"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.sendCodeTouchableOpacity, loading && styles.sendCodeDisabled]}
                onPress={onSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendCodeTouchableOpacityText}>SUBMIT APPLICATION</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.link} onPress={goBack}>
                <Text style={styles.linkText}>Cancel</Text>
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
  sentErrorText: {
    fontFamily: "Sen_400Regular",
    color: '#E53935',
    fontSize: 14,
    marginTop: 16
  },
  sentText: {
    fontFamily: "Sen_400Regular",
    color: '#32343E',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 32
  },
  resentText: {
    fontFamily: "Sen_400Regular",
    color: '#2E7D32',
    fontSize: 14,
    marginTop: 16
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
  resendTouchableOpacity: {
    width: 'auto',
    height: 62,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: '#FF7622',
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24
  },
  resendTouchableOpacityText: {
    fontFamily: "Sen_700Bold",
    color: "#FF7622",
    fontSize: 14,
  },
  link: {
    alignItems: 'center',
    marginTop: 16
  },
  linkText: {
    fontFamily: "Sen_400Regular",
    color: '#5E616F',
    fontSize: 14
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