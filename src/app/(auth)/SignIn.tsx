import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSignIn } from '@clerk/clerk-expo';

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailMissing = submitted && !emailAddress.trim();
  const passwordMissing = submitted && !password;

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
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(tabs)/HomeScreen');
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
          <TextInput
            style={[styles.input, passwordMissing && styles.inputError]}
            placeholder="* * * * * * * * * * "
            placeholderTextColor="#A0A5BA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.checkboxWrapper}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? '#FF7622' : undefined}
          />
          <Text style={styles.checkboxlabel}>Remember me</Text>
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
  errorText: {
    fontFamily: "Sen_400Regular",
    color: '#E53935',
    fontSize: 14,
    marginBottom: 16
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
  }
});

export default SignIn;