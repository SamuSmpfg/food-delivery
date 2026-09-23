import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';

const CODE_LENGTH = 4;

const PasswordVerification = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '');

    if (!digits) {
      const next = [...code];
      next[index] = '';
      setCode(next);
      return;
    }

    const next = [...code];
    for (let i = 0; i < digits.length && index + i < CODE_LENGTH; i++) {
      next[index + i] = digits[i];
    }
    setCode(next);

    const focusIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
    inputs.current[focusIndex]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || loading) return;

    const fullCode = code.join('');

    if (fullCode.length < CODE_LENGTH) {
      setError('Type the entire code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: fullCode });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        setError('Could not complete the verification');
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid Code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.mainContainerTitle}>Verification</Text>
        <Text style={styles.mainContainerText}>We have sent a code to your email</Text>
        <Text style={styles.mainContainerTextEmail}>{signUp?.emailAddress ?? ''}</Text>
      </View>

      <ScrollView
        style={styles.logInSpace}
        contentContainerStyle={styles.logInSpaceContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.inputLabel}>CODE</Text>
        <View style={styles.inputWrapper}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputs.current[index] = ref; }}
              style={styles.input}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={index === 0 ? CODE_LENGTH : 1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.verificationCodeTouchableOpacity, loading && styles.verificationCodeDisabled]}
          onPress={onVerifyPress}
          disabled={loading || !isLoaded}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verificationCodeTouchableOpacityText}>VERIFY</Text>
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
  mainContainerTextEmail: {
    fontFamily: "Sen_700Bold",
    color: "#fff",
    fontSize: 16,
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
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputLabel: {
    fontFamily: "Sen_400Regular",
    color: '#32343E',
  },
  input: {
    backgroundColor: "#F0F5FA",
    width: 48,
    height: 62,
    marginTop: 10,
    borderRadius: 10,
    textAlign: 'center',
    fontFamily: "Sen_700Bold",
    fontSize: 20,
    color: '#32343E'
  },
  errorText: {
    fontFamily: "Sen_400Regular",
    color: '#E53935',
    fontSize: 14,
    marginBottom: 16
  },
  verificationCodeTouchableOpacity: {
    width: 'auto',
    height: 62,
    backgroundColor: "#FF7622",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  verificationCodeDisabled: {
    opacity: 0.6
  },
  verificationCodeTouchableOpacityText: {
    fontFamily: "Sen_700Bold",
    color: "#FFFFFF",
    fontSize: 14,
  }
});

export default PasswordVerification;