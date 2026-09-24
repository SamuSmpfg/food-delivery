import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, Image, View, StyleSheet, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import useLocation from '../../../hooks/useLocation';
import { useRouter } from 'expo-router';

const LocationAcess = () => {

  const { latitude, longitude, errorMessage, getLocation } = useLocation()
  const router = useRouter()
  const [requested, setRequested] = useState(false)

  const denied = requested && !!errorMessage

  useEffect(() => {
    if (requested && latitude != null && longitude != null) {
      router.replace('/(tabs)/HomeScreen')
    }
  }, [requested, latitude, longitude])

  const onAccessLocationPress = () => {
    setRequested(true)
    getLocation()
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View>
        <Image 
          source={require('../../../assets/images/flat-map.jpeg')} 
          resizeMode="contain"
          style={styles.mapImage}
        />
        <TouchableOpacity 
        style={styles.accessLocationTouchableOpacity} 
        onPress={onAccessLocationPress}>
          <Text style={styles.accessLocationTextTouchableOpacity}>ACCESS LOCATION</Text>
          <Feather name="map-pin" size={16} color="#fff" style={styles.iconLocation}/>
        </TouchableOpacity>

        {denied ? (
          <View>
            <Text style={styles.errorText}>{errorMessage}</Text>

            <TouchableOpacity
              style={styles.settingsTouchableOpacity}
              onPress={() => Linking.openSettings()}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsText}>OPEN SETTINGS</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(tabs)/HomeScreen')}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        
        <Text style={styles.accessLocationText}>
          DFOOD WILL ACCESS YOUR LOCATION ONLY WHILE USING THE APP
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48
  },
  mapImage: {
    width: 270,
    height: 270,
    marginBottom: 48,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  accessLocationTouchableOpacity: {
    flexDirection: 'row',
    width: 'auto',
    height: 62,
    backgroundColor: "#FF7622",
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  accessLocationTextTouchableOpacity: {
    color: '#fff',
    fontSize: 16,
    fontFamily: "Sen_700Bold",
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    fontFamily: "Sen_400Regular",
    textAlign: 'center',
    marginTop: 8
  },
  settingsTouchableOpacity: {
    height: 52,
    borderWidth: 1,
    borderColor: '#FF7622',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16
  },
  settingsText: {
    color: '#FF7622',
    fontSize: 14,
    fontFamily: "Sen_700Bold",
  },
  skipText: {
    color: '#646982',
    fontSize: 14,
    fontFamily: "Sen_400Regular",
    textAlign: 'center',
    marginTop: 16
  },
  accessLocationText: {
    color: '#646982',
    fontSize: 14,
    marginTop: 32,
    alignItems: 'center',
    fontFamily: "Sen_400Regular",
    textAlign: 'center'
  },
  iconLocation: {
    marginLeft: 16,
    backgroundColor: '#ff914e',
    padding: 10,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  }
})

export default LocationAcess