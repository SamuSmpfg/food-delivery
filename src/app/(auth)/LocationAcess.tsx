import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from "react-native-safe-area-context";
import useLocation from '../../../hooks/useLocation';
import { useRouter } from 'expo-router';

const LocationAcess = () => {

  const { latitude, longitude, errorMessage, getLocation } = useLocation()
  const router = useRouter()
  const [requested, setRequested] = useState(false)

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

        {requested && errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
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
    backgroundColor: '#fff',
    height: 900,
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