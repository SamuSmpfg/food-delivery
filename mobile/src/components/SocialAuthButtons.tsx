import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Location from 'expo-location';
import { useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

type Provider = 'oauth_facebook' | 'oauth_x' | 'oauth_apple';

const PROVIDERS: {
  strategy: Provider;
  icon: string;
  size: number;
  style: object;
}[] = [
  { strategy: 'oauth_facebook', icon: 'facebook-f', size: 26, style: { backgroundColor: '#3F5994' } },
  { strategy: 'oauth_x', icon: 'twitter', size: 26, style: { backgroundColor: '#489BE6' } },
  { strategy: 'oauth_apple', icon: 'apple', size: 28, style: { backgroundColor: '#1D2030' } },
];

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function SocialAuthButtons() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [loading, setLoading] = useState<Provider | null>(null);

  const handlePress = useCallback(
    async (strategy: Provider) => {
      if (loading) return;

      try {
        setLoading(strategy);

        const { createdSessionId, setActive } = await startSSOFlow({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri(),
        });

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });

          const { status } = await Location.getForegroundPermissionsAsync();

          if (status === 'granted') {
            router.replace('/(tabs)/HomeScreen');
          } else {
            router.replace('/LocationAcess');
          }
        }
      } catch (err: any) {
        console.error('Erro no login social:', JSON.stringify(err, null, 2));
        Alert.alert('Error', 'Could not log in. Please try again.');
      } finally {
        setLoading(null);
      }
    },
    [loading, startSSOFlow, router]
  );

  return (
    <View style={styles.socialRow}>
      {PROVIDERS.map((p) => (
        <TouchableOpacity
          key={p.strategy}
          activeOpacity={0.8}
          disabled={loading !== null}
          onPress={() => handlePress(p.strategy)}
          style={[styles.socialCircle, p.style, loading && loading !== p.strategy && styles.disabled]}
        >
          {loading === p.strategy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <FontAwesome5 name={p.icon} size={p.size} color="#FFFFFF" brand />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 24,
  },
  socialCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});