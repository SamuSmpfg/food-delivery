import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { useSignIn, useAuth } from '@clerk/clerk-expo';

const RESEND_SECONDS = 30;

const ForgotPassword = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

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
            <TextInput
              style={styles.input}
              placeholder="* * * * * * * * * *"
              placeholderTextColor="#A0A5BA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
            />

            <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>RE-TYPE PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="* * * * * * * * * *"
              placeholderTextColor="#A0A5BA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
            />
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
  }
});

export default ForgotPassword;