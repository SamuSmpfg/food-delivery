import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Location from 'expo-location'
import MapView, { Region } from 'react-native-maps'
import { AddressLabel, getAddressById, saveAddress } from '../../lib/addressStore'

const LABELS: AddressLabel[] = ['Home', 'Work', 'Other']
const DELTA = { latitudeDelta: 0.005, longitudeDelta: 0.005 }

const AddAddress = () => {

  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const skipNextRegionChange = useRef(false)
  const requestId = useRef(0)

  const [region, setRegion] = useState<Region | null>(null)
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [address, setAddress] = useState('')
  const [street, setStreet] = useState('')
  const [postCode, setPostCode] = useState('')
  const [apartment, setApartment] = useState('')
  const [label, setLabel] = useState<AddressLabel>('Home')
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [saving, setSaving] = useState(false)

  const fillFromCoords = useCallback(async (latitude: number, longitude: number) => {
    const current = ++requestId.current
    setCoords({ latitude, longitude })
    setLoadingAddress(true)
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (current !== requestId.current) return
      const place = results[0]
      if (!place) return
      const streetLine = [place.street ?? place.name, place.streetNumber]
        .filter(Boolean)
        .join(', ')
      const fullAddress = [
        streetLine,
        place.district,
        place.city ?? place.subregion,
        place.region,
        place.postalCode,
      ]
        .filter(Boolean)
        .join(', ')
      setAddress(fullAddress)
      setStreet(place.street ?? place.name ?? '')
      setPostCode(place.postalCode ?? '')
    } catch {
    } finally {
      if (current === requestId.current) setLoadingAddress(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const init = async () => {
      if (id) {
        const existing = await getAddressById(id)
        if (existing && active) {
          skipNextRegionChange.current = true
          setAddress(existing.address)
          setStreet(existing.street)
          setPostCode(existing.postCode)
          setApartment(existing.apartment)
          setLabel(existing.label)
          setCoords({ latitude: existing.latitude, longitude: existing.longitude })
          setRegion({ latitude: existing.latitude, longitude: existing.longitude, ...DELTA })
          return
        }
      }

      let permission = await Location.getForegroundPermissionsAsync()
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync()
      }
      if (permission.status !== 'granted') {
        Alert.alert(
          'Localização desativada',
          'Permita o acesso à localização para preencher o endereço automaticamente.'
        )
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      if (!active) return
      const { latitude, longitude } = position.coords
      skipNextRegionChange.current = true
      setRegion({ latitude, longitude, ...DELTA })
      fillFromCoords(latitude, longitude)
    }

    init()
    return () => {
      active = false
    }
  }, [id, fillFromCoords])

  const handleRegionChangeComplete = (next: Region) => {
    if (skipNextRegionChange.current) {
      skipNextRegionChange.current = false
      return
    }
    fillFromCoords(next.latitude, next.longitude)
  }

  const handleSave = async () => {
    if (!address.trim() || !coords) {
      Alert.alert('Endereço obrigatório', 'Aguarde a localização ou informe o endereço.')
      return
    }
    setSaving(true)
    try {
      await saveAddress({
        id: id || undefined,
        label,
        address: address.trim(),
        street: street.trim(),
        postCode: postCode.trim(),
        apartment: apartment.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      router.back()
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.mapContainer}>
          {region ? (
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation
              showsMyLocationButton={false}
              toolbarEnabled={false}
            />
          ) : (
            <View style={styles.mapLoading}>
              <ActivityIndicator color="#FF7622" />
            </View>
          )}

          <View style={styles.pinLayer} pointerEvents="none">
            <View style={styles.pinHalo}>
              <View style={styles.pinDot} />
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>Move to edit location</Text>
                <View style={styles.tooltipArrow} />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.goBackTouchableOpacity, { top: insets.top + 12 }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="keyboard-arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <SafeAreaView edges={['bottom']} style={styles.addresContainer}>
          <Text style={styles.fieldLabel}>ADDRESS</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="location-on" size={22} color="#6B6E82" />
            <TextInput
              style={styles.inputFlex}
              value={address}
              onChangeText={setAddress}
              placeholder="Endereço completo"
              placeholderTextColor="#A0A5BA"
            />
            {loadingAddress && <ActivityIndicator size="small" color="#FF7622" />}
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>STREET</Text>
              <TextInput
                style={styles.input}
                value={street}
                onChangeText={setStreet}
                placeholder="Rua"
                placeholderTextColor="#A0A5BA"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>POST CODE</Text>
              <TextInput
                style={styles.input}
                value={postCode}
                onChangeText={setPostCode}
                placeholder="CEP"
                placeholderTextColor="#A0A5BA"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>APPARTMENT</Text>
          <TextInput
            style={styles.input}
            value={apartment}
            onChangeText={setApartment}
            placeholder="Apartamento / complemento"
            placeholderTextColor="#A0A5BA"
          />

          <Text style={styles.fieldLabel}>LABEL AS</Text>
          <View style={styles.chips}>
            {LABELS.map((item) => {
              const selected = item === label
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setLabel(item)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveTouchableOpacity, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveTouchableOpacityText}>SAVE LOCATION</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapContainer: {
        height: 295,
        backgroundColor: '#D3DAE2',
        overflow: 'hidden',
    },
    mapLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinHalo: {
        width: 36,
        height: 36,
        borderRadius: 100,
        backgroundColor: 'rgba(255,118,34,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinDot: {
        width: 24,
        height: 24,
        borderRadius: 100,
        backgroundColor: '#FF7622',
    },
    tooltip: {
        position: 'absolute',
        bottom: 38,
        width: 180,
        alignItems: 'center',
    },
    tooltipText: {
        fontFamily: 'Sen_400Regular',
        fontSize: 12,
        color: '#fff',
        backgroundColor: '#181C2E',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        overflow: 'hidden',
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 7,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#181C2E',
    },
    goBackTouchableOpacity: {
        position: 'absolute',
        left: 24,
        backgroundColor: '#181C2E',
        width: 45,
        height: 45,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addresContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 24,
    },
    fieldLabel: {
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#32343E',
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 62,
        borderRadius: 12,
        backgroundColor: '#F0F5FA',
        paddingHorizontal: 18,
        gap: 10,
        marginBottom: 24,
    },
    inputFlex: {
        flex: 1,
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#6B6E82',
    },
    input: {
        height: 62,
        borderRadius: 12,
        backgroundColor: '#F0F5FA',
        paddingHorizontal: 18,
        fontFamily: 'Sen_400Regular',
        fontSize: 14,
        color: '#6B6E82',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    half: {
        flex: 1,
    },
    chips: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    chip: {
        paddingHorizontal: 28,
        height: 56,
        borderRadius: 100,
        backgroundColor: '#F0F5FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipSelected: {
        backgroundColor: '#FF7622',
    },
    chipText: {
        fontFamily: 'Sen_400Regular',
        fontSize: 15,
        color: '#181C2E',
    },
    chipTextSelected: {
        color: '#fff',
    },
    saveTouchableOpacity: {
        backgroundColor: '#FF7622',
        height: 62,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveTouchableOpacityText: {
        fontFamily: 'Sen_700Bold',
        fontSize: 14,
        color: '#fff',
    },
})

export default AddAddress